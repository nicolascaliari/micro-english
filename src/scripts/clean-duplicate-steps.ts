import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LearningStep } from '../learning-steps/schemas/learning-step.schema';

/**
 * Script para limpiar steps duplicados en learning_steps
 * 
 * Este script:
 * 1. Encuentra steps duplicados (mismo title + type + categoryId)
 * 2. Para cada grupo, mantiene el que tiene order definido y unlock_requirements
 * 3. Elimina los duplicados
 * 
 * Ejecutar con: npm run clean-duplicate-steps
 */
async function cleanDuplicateSteps() {
  console.log('🚀 Iniciando limpieza de steps duplicados...\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const learningStepModel = app.get<Model<LearningStep>>(
    getModelToken(LearningStep.name),
  );

  try {
    // Encontrar todos los steps duplicados usando agregación
    const duplicates = await learningStepModel.aggregate([
      {
        $group: {
          _id: { 
            title: '$title', 
            type: '$type',
            categoryId: '$categoryId'
          },
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

    console.log(`📊 Encontrados ${duplicates.length} grupos de steps duplicados\n`);

    if (duplicates.length === 0) {
      console.log('✅ No hay steps duplicados para limpiar');
      await app.close();
      return;
    }

    let totalDeleted = 0;
    let totalKept = 0;

    // Procesar cada grupo de duplicados
    for (const group of duplicates) {
      const docs = group.docs;
      console.log(
        `\n📝 Procesando grupo: ${group._id.title} (${group._id.type})`,
      );
      console.log(`   Documentos encontrados: ${docs.length}`);

      // Ordenar documentos por prioridad:
      // 1. Tiene order definido
      // 2. Tiene unlock_requirements definido
      // 3. Fecha de creación más antigua (el original)
      docs.sort((a, b) => {
        // Prioridad 1: Tiene order definido
        const hasOrderA = a.order !== undefined && a.order !== null;
        const hasOrderB = b.order !== undefined && b.order !== null;
        if (hasOrderA && !hasOrderB) return -1;
        if (!hasOrderA && hasOrderB) return 1;

        // Prioridad 2: Tiene unlock_requirements definido
        const hasUnlockA = a.unlock_requirements && a.unlock_requirements.length > 0;
        const hasUnlockB = b.unlock_requirements && b.unlock_requirements.length > 0;
        if (hasUnlockA && !hasUnlockB) return -1;
        if (!hasUnlockA && hasUnlockB) return 1;

        // Prioridad 3: Fecha de creación más antigua
        const dateA = a.createdAt || new Date(0);
        const dateB = b.createdAt || new Date(0);
        return dateA.getTime() - dateB.getTime();
      });

      // El primer documento es el que se mantiene
      const keepDoc = docs[0];
      const deleteIds = docs.slice(1).map((d) => d._id);

      console.log(`   ✅ Manteniendo step:`);
      console.log(`      _id: ${keepDoc._id}`);
      console.log(`      title: ${keepDoc.title}`);
      console.log(`      type: ${keepDoc.type}`);
      console.log(`      order: ${keepDoc.order !== undefined ? keepDoc.order : 'NO DEFINIDO'}`);
      console.log(`      unlock_requirements: [${keepDoc.unlock_requirements || []}]`);
      console.log(`      createdAt: ${keepDoc.createdAt || 'N/A'}`);

      console.log(`   🗑️  Eliminando ${deleteIds.length} step(s) duplicado(s):`);
      deleteIds.forEach((id, index) => {
        const doc = docs[index + 1];
        console.log(`      - _id: ${id}`);
        console.log(`        order: ${doc.order !== undefined ? doc.order : 'NO DEFINIDO'}`);
        console.log(`        unlock_requirements: [${doc.unlock_requirements || []}]`);
      });

      // Eliminar los steps duplicados
      const deleteResult = await learningStepModel.deleteMany({
        _id: { $in: deleteIds },
      });

      totalDeleted += deleteResult.deletedCount || 0;
      totalKept += 1;
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Limpieza completada exitosamente');
    console.log(`📊 Resumen:`);
    console.log(`   - Grupos de duplicados procesados: ${duplicates.length}`);
    console.log(`   - Steps mantenidos: ${totalKept}`);
    console.log(`   - Steps eliminados: ${totalDeleted}`);
    console.log('='.repeat(60) + '\n');

    if (totalDeleted > 0) {
      console.log('⚠️  IMPORTANTE:');
      console.log('   Después de limpiar los steps duplicados, debes:');
      console.log('   1. Limpiar el progreso de usuario (npm run clean-duplicates)');
      console.log('   2. Configurar unlock_requirements (npm run fix-unlocks)');
      console.log('   3. Redesplegar el backend en producción');
    }

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    throw error;
  } finally {
    await app.close();
  }
}

// Ejecutar el script
cleanDuplicateSteps()
  .then(() => {
    console.log('\n✅ Script finalizado correctamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });

