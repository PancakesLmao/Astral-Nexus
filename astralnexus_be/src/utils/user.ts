import { queryOne, query } from "./database";
import { validationUtils } from "./auth";
import { createWelcomeNotification } from "../routes/notifications";

// User management utilities
export const findOrCreateUser = async (
  email: string,
  name: string,
  picture: string,
  provider: string
) => {
  try {
    // Validate email format before processing
    if (!validationUtils.isEmail(email)) {
      throw new Error(`Invalid email format: ${email}`);
    }

    // Sanitize input data
    const sanitizedEmail = validationUtils.sanitizeInput(email).toLowerCase();
    const sanitizedName = validationUtils.sanitizeInput(name);
    const sanitizedPicture = validationUtils.sanitizeInput(picture);

    // First, ensure the provider exists
    let providerRecord = await queryOne(
      "SELECT id FROM providers WHERE provider_name = $1",
      [provider]
    );

    if (!providerRecord) {
      await query("INSERT INTO providers (provider_name) VALUES ($1)", [
        provider,
      ]);
      providerRecord = await queryOne(
        "SELECT id FROM providers WHERE provider_name = $1",
        [provider]
      );
    }

    // Check if user already exists
    let user = await queryOne(
      `SELECT u.*, p.provider_name 
       FROM users u 
       JOIN providers p ON u.provider_id = p.id 
       WHERE u.email = $1`,
      [sanitizedEmail]
    );

    if (user) {
      // Update user info if they exist
      await query(
        "UPDATE users SET name = $1, picture = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
        [sanitizedName, sanitizedPicture, user.id]
      );

      return {
        id: user.id,
        email: user.email,
        name: sanitizedName,
        picture: sanitizedPicture,
        provider: user.provider_name,
        created_at: user.created_at,
        updated_at: new Date().toISOString(),
      };
    } else {
      // Create new user
      const newUser = await queryOne(
        `INSERT INTO users (email, name, picture, provider_id) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, email, name, picture, created_at, updated_at`,
        [sanitizedEmail, sanitizedName, sanitizedPicture, providerRecord.id]
      );

      // Create welcome notification for new user
      try {
        await createWelcomeNotification(newUser.id);
        console.log(`Welcome notification created for new user: ${newUser.id}`);
      } catch (error) {
        console.error(
          `Failed to create welcome notification for user ${newUser.id}:`,
          error
        );
        // Don't throw error - user creation should still succeed even if notification fails
      }

      return {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        picture: newUser.picture,
        provider,
        created_at: newUser.created_at,
        updated_at: newUser.updated_at,
      };
    }
  } catch (error) {
    console.error("Error in findOrCreateUser:", error);
    throw error;
  }
};

export const getUserById = async (userId: string) => {
  try {
    const user = await queryOne(
      `SELECT u.*, p.provider_name 
       FROM users u 
       JOIN providers p ON u.provider_id = p.id 
       WHERE u.id = $1`,
      [userId]
    );

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      provider: user.provider_name,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  } catch (error) {
    console.error("Error in getUserById:", error);
    throw error;
  }
};
