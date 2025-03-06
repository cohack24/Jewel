import type { NextApiRequest, NextApiResponse } from "next";

import db from "@/utils/supabaseUtil";

import { createClient } from "@supabase/supabase-js";

import { Resend } from "resend";
import { AuthData } from "@/types/interfaces";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const resend = new Resend(process.env.RESEND_API_KEY);
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {

        try {
            const { email, password } = req.body;
            
            const authUser: AuthData = await db.createUser(email, password);
            // const verificationCode: string = await db.createVerificationCode(authUser.user.id);

            // await resend.emails.send({
            //     from: "onboarding@resend.dev",
            //     to: email,
            //     subject: "Resend Verification Code",
            //     text: verificationCode
            // });            

            res.status(200).json({
				success: true,
				message: 'Signup successful. Verification code sent.',
				authUserId: authUser.user.id, 
			});        
        }
        catch (error) {
            console.error("Error signing up user", error);
            res.status(500).json({ success: false, error: "An error occurred while signing up" });
        }
    }
}