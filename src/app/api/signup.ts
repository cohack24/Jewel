import type { NextApiRequest, NextApiResponse } from "next";

import db from "@/utils/supabaseUtil";

import { AuthResponse, UserResponse } from "@supabase/supabase-js";

import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";


const supabase = createClient();
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {

        try {
            
            const authUser: UserResponse = await supabase.auth.getUser();
            
            if (authUser.error) {
                res.status(401).json({ success: false, error: authUser.error.message });
                return;
            }

            if (!(authUser.data && authUser.data.user)) {
                res.status(401).json({ success: false, error: "User unauthenticated" });
                return;
            }

            const {
                firstName,
                email,
                occupation,
                goal,
                emailFrequency,
            } = req.body;

         
            const profile = await db.addProfile(
                firstName,
                email,
                occupation,
                goal,
                emailFrequency,
                authUser.data.user.id,
            );


                  

            res.status(201).json({ success: true, userId: authUser.data.user.id });        
        }
        catch (error) {
            console.error("Error signing up user", error);
            res.status(500).json({ success: false, error: "An error occurred while signing up" });
        }
    }
}

 