
import { db } from "./storage";
import { modules as moduleData } from "./data/modules";
import { sql } from "drizzle-orm";

async function seedDatabase() {
  console.log("🌱 Starting database seeding...");

  try {
    // Clear existing data
    console.log("Clearing existing modules and exercises...");
    await db.execute(sql`DELETE FROM exercises`);
    await db.execute(sql`DELETE FROM modules`);

    // Insert modules and exercises
    for (const module of moduleData) {
      console.log(`📚 Inserting module: ${module.title}`);
      
      // Insert module
      await db.execute(sql`
        INSERT INTO modules (id, title, description, objectives, concepts, created_at, updated_at)
        VALUES (
          ${module.id},
          ${module.title},
          ${module.description},
          ${JSON.stringify(module.objectives)},
          ${JSON.stringify(module.concepts)},
          NOW(),
          NOW()
        )
      `);

      // Insert exercises for this module
      for (const exercise of module.exercises) {
        console.log(`  📝 Inserting exercise: ${exercise.title}`);
        
        await db.execute(sql`
          INSERT INTO exercises (id, module_id, title, description, problem, example, model_answer, created_at, updated_at)
          VALUES (
            ${exercise.id},
            ${module.id},
            ${exercise.title},
            ${exercise.description},
            ${exercise.problem},
            ${exercise.example},
            ${exercise.modelAnswer || null},
            NOW(),
            NOW()
          )
        `);
      }
    }

    console.log("✅ Database seeding completed successfully!");
    console.log(`📊 Seeded ${moduleData.length} modules with ${moduleData.reduce((total, m) => total + m.exercises.length, 0)} exercises`);
    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log("🎉 Seeding complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Seeding failed:", error);
      process.exit(1);
    });
}

export { seedDatabase };
