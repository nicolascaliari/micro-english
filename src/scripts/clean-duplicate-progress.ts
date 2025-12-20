import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserProgress } from '../user-progress/schemas/user-progress.schema';

/**
 * Script para limpiar documentos duplicados en user_progress
 * 
 * Este script:
 * 1. Encuentra todos los documentos duplicados (mismo userId + stepId)
 * 2. Para cada grupo de duplicados, mantiene el más reciente o el completado
 * 3. Elimina los documentos duplicados restantes
 * 
 * Ejecutar con: npm run clean-duplicates
 */
async function cleanDuplicateProgress() {
  console.log('🚀 Iniciando limpieza de duplicados en user_progress...\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const userProgressModel = app.get<Model<UserProgress>>(
    getModelToken(UserProgress.name),
  );

  try {
    // Encontrar todos los documentos duplicados usando agregación
    const duplicates = await userProgressModel.aggregate([
      {
        $group: {
          _id: { userId: '$userId', stepId: '$stepId' },
          docs: { $push: '$$ROOT' },
          count: { $sum: 1 },
        },
      },
      {
        $match: {
          count: { $gt: 1 },
        },
      },
    ]);

    console.log(`📊 Encontrados ${duplicates.length} grupos de duplicados\n`);

    if (duplicates.length === 0) {
      console.log('✅ No hay duplicados para limpiar');
      await app.close();
      return;
    }

    let totalDeleted = 0;
    let totalKept = 0;

    // Procesar cada grupo de duplicados
    for (const group of duplicates) {
      const docs = group.docs;
      console.log(
        `\n📝 Procesando grupo: userId=${group._id.userId}, stepId=${group._id.stepId}`,
      );
      console.log(`   Documentos encontrados: ${docs.length}`);

      // Ordenar documentos por prioridad:
      // 1. Estado 'completed' tiene prioridad
      // 2. Luego por fecha de actualización más reciente
      // 3. Luego por score más alto
      docs.sort((a, b) => {
        // Prioridad 1: completed > in_progress > locked
        const statusPriority = { completed: 3, in_progress: 2, locked: 1 };
        const priorityDiff =
          (statusPriority[b.status] || 0) - (statusPriority[a.status] || 0);
        if (priorityDiff !== 0) return priorityDiff;

        // Prioridad 2: fecha de actualización más reciente
        const dateA = a.updatedAt || a.createdAt || new Date(0);
        const dateB = b.updatedAt || b.createdAt || new Date(0);
        const dateDiff = dateB.getTime() - dateA.getTime();
        if (dateDiff !== 0) return dateDiff;

        // Prioridad 3: score más alto
        return (b.score || 0) - (a.score || 0);
      });

      // El primer documento es el que se mantiene
      const keepDoc = docs[0];
      const deleteIds = docs.slice(1).map((d) => d._id);

      console.log(`   ✅ Manteniendo documento:`);
      console.log(`      _id: ${keepDoc._id}`);
      console.log(`      status: ${keepDoc.status}`);
      console.log(`      score: ${keepDoc.score}`);
      console.log(`      updatedAt: ${keepDoc.updatedAt || 'N/A'}`);

      console.log(`   🗑️  Eliminando ${deleteIds.length} documento(s) duplicado(s):`);
      deleteIds.forEach((id, index) => {
        const doc = docs[index + 1];
        console.log(`      - _id: ${id} (status: ${doc.status}, score: ${doc.score})`);
      });

      // Eliminar los documentos duplicados
      const deleteResult = await userProgressModel.deleteMany({
        _id: { $in: deleteIds },
      });

      totalDeleted += deleteResult.deletedCount || 0;
      totalKept += 1;
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Limpieza completada exitosamente');
    console.log(`📊 Resumen:`);
    console.log(`   - Grupos de duplicados procesados: ${duplicates.length}`);
    console.log(`   - Documentos mantenidos: ${totalKept}`);
    console.log(`   - Documentos eliminados: ${totalDeleted}`);
    console.log('='.repeat(60) + '\n');
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    throw error;
  } finally {
    await app.close();
  }
}

// Ejecutar el script
cleanDuplicateProgress()
  .then(() => {
    console.log('✅ Script finalizado correctamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });

