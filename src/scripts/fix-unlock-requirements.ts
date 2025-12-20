import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LearningStep } from '../learning-steps/schemas/learning-step.schema';

/**
 * Script para corregir los unlock_requirements de los learning steps
 * para que se desbloqueen secuencialmente dentro de cada categoría
 * 
 * Lógica:
 * - El primer step (vocabulary) de la primera categoría no tiene requisitos
 * - El primer step de las demás categorías requiere el último step de la categoría anterior
 * - Los demás steps requieren el step inmediatamente anterior (por order)
 * 
 * Ejecutar con: npm run fix-unlocks
 */
async function fixUnlockRequirements() {
  console.log('🔧 Corrigiendo unlock_requirements de learning steps...\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const learningStepModel = app.get<Model<LearningStep>>(
    getModelToken(LearningStep.name),
  );

  try {
    // Obtener todos los steps ordenados por order
    const steps = await learningStepModel
      .find({ is_active: true })
      .populate('categoryId')
      .sort({ order: 1 })
      .exec();

    console.log(`📊 Total de steps encontrados: ${steps.length}\n`);

    // Agrupar por categoría
    const stepsByCategory = new Map<string, any[]>();
    
    for (const step of steps) {
      const stepData = step as any;
      const categoryId = stepData.categoryId?._id?.toString() || 'unknown';
      
      if (!stepsByCategory.has(categoryId)) {
        stepsByCategory.set(categoryId, []);
      }
      
      stepsByCategory.get(categoryId)!.push({
        _id: stepData._id,
        title: stepData.title,
        type: stepData.type,
        order: stepData.order,
        categoryName: stepData.categoryId?.name || 'Unknown',
        categoryOrder: stepData.categoryId?.order || 0,
        current_unlock_requirements: stepData.unlock_requirements || [],
      });
    }

    // Ordenar categorías por order
    const sortedCategories = Array.from(stepsByCategory.entries()).sort(
      (a, b) => {
        const orderA = a[1][0]?.categoryOrder || 0;
        const orderB = b[1][0]?.categoryOrder || 0;
        return orderA - orderB;
      }
    );

    let updatedCount = 0;
    let previousCategoryLastOrder: number | null = null;

    // Procesar cada categoría
    for (let catIndex = 0; catIndex < sortedCategories.length; catIndex++) {
      const [categoryId, categorySteps] = sortedCategories[catIndex];
      const categoryName = categorySteps[0]?.categoryName || 'Unknown';
      const categoryOrder = categorySteps[0]?.categoryOrder || 0;
      
      console.log('='.repeat(70));
      console.log(`📚 Procesando Categoría: ${categoryName} (order: ${categoryOrder})`);
      console.log('='.repeat(70));

      // Ordenar steps dentro de la categoría por order
      categorySteps.sort((a, b) => a.order - b.order);

      for (let stepIndex = 0; stepIndex < categorySteps.length; stepIndex++) {
        const step = categorySteps[stepIndex];
        let newUnlockRequirements: number[] = [];

        if (catIndex === 0 && stepIndex === 0) {
          // Primer step de la primera categoría: sin requisitos
          newUnlockRequirements = [];
          console.log(`\n  ✅ ${step.title} (order: ${step.order})`);
          console.log(`     Primer step de la primera categoría - Sin requisitos`);
        } else if (stepIndex === 0) {
          // Primer step de las demás categorías: requiere el último step de la categoría anterior
          if (previousCategoryLastOrder !== null) {
            newUnlockRequirements = [previousCategoryLastOrder];
            console.log(`\n  🔓 ${step.title} (order: ${step.order})`);
            console.log(`     Primer step de categoría - Requiere step order ${previousCategoryLastOrder}`);
          } else {
            newUnlockRequirements = [];
            console.log(`\n  ⚠️  ${step.title} (order: ${step.order})`);
            console.log(`     Advertencia: No hay categoría anterior`);
          }
        } else {
          // Demás steps: requieren el step inmediatamente anterior
          const previousStep = categorySteps[stepIndex - 1];
          newUnlockRequirements = [previousStep.order];
          console.log(`\n  🔒 ${step.title} (order: ${step.order})`);
          console.log(`     Requiere step anterior: ${previousStep.title} (order: ${previousStep.order})`);
        }

        // Comparar con los requisitos actuales
        const currentReqs = step.current_unlock_requirements.sort((a, b) => a - b);
        const newReqs = newUnlockRequirements.sort((a, b) => a - b);
        const hasChanged = JSON.stringify(currentReqs) !== JSON.stringify(newReqs);

        if (hasChanged) {
          console.log(`     Actual: [${currentReqs.join(', ')}]`);
          console.log(`     Nuevo:  [${newReqs.join(', ')}]`);
          console.log(`     🔄 Actualizando...`);

          // Actualizar en la base de datos
          await learningStepModel.updateOne(
            { _id: step._id },
            { $set: { unlock_requirements: newUnlockRequirements } }
          );

          updatedCount++;
        } else {
          console.log(`     ✓ Ya está correcto: [${currentReqs.join(', ')}]`);
        }
      }

      // Guardar el order del último step de esta categoría
      if (categorySteps.length > 0) {
        previousCategoryLastOrder = categorySteps[categorySteps.length - 1].order;
      }

      console.log('\n');
    }

    console.log('='.repeat(70));
    console.log(`\n✅ Corrección completada`);
    console.log(`📊 Resumen:`);
    console.log(`   - Steps procesados: ${steps.length}`);
    console.log(`   - Steps actualizados: ${updatedCount}`);
    console.log(`   - Steps sin cambios: ${steps.length - updatedCount}`);
    console.log('='.repeat(70));

    if (updatedCount > 0) {
      console.log('\n💡 IMPORTANTE:');
      console.log('   Los unlock_requirements han sido actualizados.');
      console.log('   Ahora los steps se desbloquearán secuencialmente:');
      console.log('   1. Completa vocabulary → desbloquea grammar');
      console.log('   2. Completa grammar → desbloquea tips');
      console.log('   3. Completa tips → desbloquea reading');
      console.log('   4. Y así sucesivamente...');
      console.log('\n   Al completar el último step de una categoría,');
      console.log('   se desbloqueará el primer step (vocabulary) de la siguiente categoría.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await app.close();
  }
}

// Ejecutar el script
fixUnlockRequirements()
  .then(() => {
    console.log('\n✅ Script finalizado correctamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });

