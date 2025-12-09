import type { NextApiRequest, NextApiResponse } from "next";

import db from "@/utils/supabaseUtil";

import { AuthResponse, createClient } from "@supabase/supabase-js";

import { Resend } from "resend";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const resend = new Resend(process.env.RESEND_API_KEY);
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {

        try {
            const { email, password } = req.body;
            
            const authUser: AuthResponse = await supabase.auth.signUp({
                email: email,
                password: password
            });
            
            if (authUser.error) {
                res.status(400).json({ success: false, error: authUser.error.message });
                return;
            }

            if (!(authUser.data && authUser.data.user)) {
                res.status(400).json({ success: false, error: "User data is missing" });
                return;
            }

            const authUserId = authUser.data.user.id;
            
            const verificationCode: string = await db.createVerificationCode(authUserId);

            await resend.emails.send({
                from: "onboarding@resend.dev",
                to: email,
                subject: "Resend Verification Code",
                text: verificationCode
            })            

            res.status(200).json({
				success: true,
				message: 'Signup successful. Verification code sent.',
				authUserId: authUserId, 
			});        
        }
        catch (error) {
            console.error("Error signing up user", error);
            res.status(500).json({ success: false, error: "An error occurred while signing up" });
        }
    }
}