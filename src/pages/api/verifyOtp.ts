import { NextApiRequest, NextApiResponse } from 'next';

import db  from '@/utils/supabaseUtil';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {

        try {
            const { email, otpCode } = req.body;
            
            if (!email || !otpCode) {
                return res.status(400).json({ message: 'Email and OTP code are required' });
            }

            db.verifyOtp(email, otpCode);

            res.status(200).json({ message: 'OTP verified successfully' });
        }
        catch (error) {
            console.error('Error verifying OTP', error);
            res.status(500).json({ message: 'An error occurred while verifying OTP' });
        }
        

    }
}