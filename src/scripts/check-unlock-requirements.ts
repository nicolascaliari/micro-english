import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LearningStep } from '../learning-steps/schemas/learning-step.schema';

/**
 * Script para verificar los unlock_requirements de los learning steps
 * 
 * Ejecutar con: npm run check-unlocks
 */
async function checkUnlockRequirements() {
  console.log('🔍 Verificando unlock_requirements de learning steps...\n');

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
      const categoryName = stepData.categoryId?.name || 'Unknown';
      
      if (!stepsByCategory.has(categoryId)) {
        stepsByCategory.set(categoryId, []);
      }
      
      stepsByCategory.get(categoryId)!.push({
        _id: stepData._id.toString(),
        title: stepData.title,
        type: stepData.type,
        order: stepData.order,
        categoryName,
        categoryOrder: stepData.categoryId?.order || 0,
        unlock_requirements: stepData.unlock_requirements || [],
      });
    }

    // Mostrar información por categoría
    const sortedCategories = Array.from(stepsByCategory.entries()).sort(
      (a, b) => {
        const orderA = a[1][0]?.categoryOrder || 0;
        const orderB = b[1][0]?.categoryOrder || 0;
        return orderA - orderB;
      }
    );

    for (const [categoryId, categorySteps] of sortedCategories) {
      const categoryName = categorySteps[0]?.categoryName || 'Unknown';
      const categoryOrder = categorySteps[0]?.categoryOrder || 0;
      
      console.log('='.repeat(70));
      console.log(`📚 Categoría: ${categoryName} (order: ${categoryOrder})`);
      console.log('='.repeat(70));
      
      for (const step of categorySteps) {
        console.log(`\n  📝 Step: ${step.title}`);
        console.log(`     Type: ${step.type}`);
        console.log(`     Order: ${step.order}`);
        console.log(`     Unlock Requirements: [${step.unlock_requirements.join(', ')}]`);
        
        if (step.unlock_requirements.length === 0) {
          console.log(`     ✅ Se desbloquea automáticamente (sin requisitos)`);
        } else {
          console.log(`     🔒 Requiere completar steps con orders: ${step.unlock_requirements.join(', ')}`);
        }
      }
      
      console.log('\n');
    }

    console.log('='.repeat(70));
    console.log('\n💡 RECOMENDACIONES:\n');
    console.log('Para desbloqueo secuencial dentro de cada categoría:');
    console.log('- El primer step (vocabulary) de cada categoría debe tener unlock_requirements vacío o solo del último step de la categoría anterior');
    console.log('- Los demás steps deben requerir el step inmediatamente anterior (por order)');
    console.log('\nEjemplo para Categoría 1 (orders 1-6):');
    console.log('  - Step order 1 (vocabulary): [] o [0] (sin requisitos o requiere step 0 de categoría anterior)');
    console.log('  - Step order 2 (grammar): [1] (requiere vocabulary)');
    console.log('  - Step order 3 (tips): [2] (requiere grammar)');
    console.log('  - Step order 4 (reading): [3] (requiere tips)');
    console.log('  - Step order 5 (listening): [4] (requiere reading)');
    console.log('  - Step order 6 (speaking): [5] (requiere listening)');
    console.log('\nEjemplo para Categoría 2 (orders 7-12):');
    console.log('  - Step order 7 (vocabulary): [6] (requiere último step de categoría 1)');
    console.log('  - Step order 8 (grammar): [7] (requiere vocabulary de categoría 2)');
    console.log('  - Step order 9 (tips): [8] (requiere grammar de categoría 2)');
    console.log('  - etc...');
    console.log('='.repeat(70));

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await app.close();
  }
}

// Ejecutar el script
checkUnlockRequirements()
  .then(() => {
    console.log('\n✅ Script finalizado correctamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });

