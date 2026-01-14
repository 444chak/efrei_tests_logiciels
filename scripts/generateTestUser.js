import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

// =====================
// CONFIG
// =====================
const USERS_COUNT = 10;
const PASSWORD = 'Password123!';
const EMAIL_PREFIX = 'loadtest_user';
const EMAIL_DOMAIN = 'test.local';

// =====================
// CLIENTS
// =====================
const adminSupabase = createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
);

const authSupabase = createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// =====================
// MAIN
// =====================
async function main() {
    const tokens = [];

    for (let i = 1; i <= USERS_COUNT; i++) {
        const email = `${EMAIL_PREFIX}_${i}@${EMAIL_DOMAIN}`;

        console.log(`👤 Creating user ${email}`);

        // 1️⃣ Create user (bypass email confirmation)
        const { data: createData, error: createError } =
            await adminSupabase.auth.admin.createUser({
                email,
                password: PASSWORD,
                email_confirm: true,
            });

        if (createError && createError.message !== 'User already exists') {
            throw createError;
        }

        // 2️⃣ Login to get JWT
        const { data: loginData, error: loginError } =
            await authSupabase.auth.signInWithPassword({
                email,
                password: PASSWORD,
            });

        if (loginError) {
            throw loginError;
        }

        tokens.push({
            email,
            password: PASSWORD,
            userId: loginData.user.id,
            accessToken: loginData.session.access_token,
        });


        console.log(`✅ Token generated for ${email}`);
    }

    // 3️⃣ Write tokens for k6
    fs.writeFileSync(
        'k6-users.json',
        JSON.stringify(tokens, null, 2)
    );

    console.log('\n🎉 DONE!');
    console.log(`➡️ Tokens saved to k6-users.json`);
}

main().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
