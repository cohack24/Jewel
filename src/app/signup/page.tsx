'use client'

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Image from "next/image";
import { useRouter } from 'next/navigation';
import {OrbitProgress} from 'react-loading-indicators'

const StepImage = ({ step } : {step: number}) => {
    const svgContent = {
        1: (
            <svg width="100%" height="100%" viewBox="0 0 720 1024" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_23_1215)">
                    <rect width="720" height="1024" fill="#191A23"/>
                    <circle cx="-8.08493" cy="1047.42" r="410.415" fill="#283314"/>
                    <circle cx="-8.08536" cy="1047.42" r="324.251" fill="#191A23"/>
                    <circle cx="-8.08475" cy="1047.42" r="248.29" fill="#283314"/>
                    <path
                        d="M407.367 72.1065C337.527 78.6991 290.022 26.7824 275 0L720 1.80266V371.606H670.298C516.402 352.034 542.309 274.005 574.499 237.436C593.299 211.77 627.292 149.93 612.87 107.902C594.844 55.3675 494.667 63.8657 407.367 72.1065Z"
                        fill="#283314"/>
                </g>
                <defs>
                    <clipPath id="clip0_23_1215">
                        <rect width="720" height="1024" fill="white"/>
                    </clipPath>
                </defs>
            </svg>
        ),

    };

    return (
        <div className="w-full h-full">
            {svgContent[1]}
        </div>
    );
};

export default function FullPageForm() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        firstName: '',
        email: '',
        occupation: '',
        goal: '',
        confirmationCode: '',
        emailFrequency: '',
        password: ''
    });

    const [loading, setLoading] = useState(false);

    const handleInputChange = (e: any) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleNext = () => setStep(prev => Math.min(prev + 1, 4));
    const handlePrev = () => setStep(prev => Math.max(prev - 1, 1));

    const handleNextStep = async () => {
        if (step === 1) {
            setLoading(true);
            try {
                console.log(formData);
                const response = await fetch("/api/signup", {
                    method: "POST",
                    body: JSON.stringify({ 
                        email: formData.email, 
                        password: formData.password 
                    }),
                    headers: { "Content-Type": "application/json" },
                });
    
                if (!response.ok) throw new Error("Signup failed");
    
                handleNext(); // Move to next step only if signup is successful
            } catch (error) {
                console.error("Signup failed:", error);
                alert("Signup failed. Please try again.");
            } finally {
                setLoading(false);
            }
        } else if (step === 2) {
            setLoading(true);
            try {
                const response = await fetch("/api/verifyOtp", {
                    method: "POST",
                    body: JSON.stringify({ email: formData.email, otp: formData.confirmationCode }),
                    headers: { "Content-Type": "application/json" },
                });
    
                if (!response.ok) throw new Error("OTP verification failed");
    
                handleNext(); // Move to next step only if OTP is verified
            } catch (error) {
                console.error("OTP verification failed:", error);
                alert("Invalid OTP. Please try again.");
            } finally {
                setLoading(false);
            }
        } else {
            handleNext();
        }
    };
    

    const handleSubmit = (e: any) => {
        e.preventDefault();
        

        console.log('Form submitted:', formData);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
           <OrbitProgress color="#32cd32" size="medium" text="" textColor="" />           
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-black flex flex-col md:flex-row">
            <header className="p-4 absolute top-0 left-0 right-0 z-10">
                <Image src="/logos/jewel(white).svg" alt="Jewel" className="h-8" width={50} height={50} />
            </header>
            <div className="w-full md:w-1/2 h-64 md:h-screen relative">
                <StepImage step={1} />
            </div>
            <div className="w-full md:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <h1 className="text-2xl md:text-3xl font-bold mb-8 text-black">
                        {step === 1 && "Personal Information"}
                        {step === 2 && "Enter Confirmation Code"}
                        {step === 3 && "Select a Goal You’ll like to Achieve"}
                        {step === 4 && "How Often Would You Like to Receive a Summary of Your Journals?"}
                    </h1>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {step === 1 && (
                            <>
                                <div>
                                    <Label htmlFor="firstName" className="text-black">First Name</Label>
                                    <Input
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 bg-gray-100 text-black border border-gray-300"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="email" className="text-black">Email address</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 bg-gray-100 text-black border border-gray-300"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="password" className="text-black">Password</Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 bg-gray-100 text-black border border-gray-300"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="occupation" className="text-black">Occupation</Label>
                                    <Input
                                        id="occupation"
                                        name="occupation"
                                        value={formData.occupation}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 bg-gray-100 text-black border border-gray-300"
                                    />
                                </div>
                            </>
                        )}

                        {step === 2 && (
                            <div>
                                <Label htmlFor="confirmationCode" className="text-black">Confirmation Code</Label>
                                <InputOTP maxLength={6} 
                                className="mt-1"
                                value={formData.confirmationCode} 
                                onChange={(value) => setFormData(prev => ({ ...prev, confirmationCode: value }))}
                                >
                                    <InputOTPGroup>
                                        <InputOTPSlot index={0} />
                                        <InputOTPSlot index={1} />
                                        <InputOTPSlot index={2} />
                                    </InputOTPGroup>
                                    <InputOTPSeparator />
                                    <InputOTPGroup>
                                        <InputOTPSlot index={3} />
                                        <InputOTPSlot index={4} />
                                        <InputOTPSlot index={5} />
                                    </InputOTPGroup>
                                </InputOTP>
                            </div>
                        )}

                        {step === 3 && (
                            <RadioGroup defaultValue="comfortable" onValueChange={(value) => setFormData(prev => ({ ...prev, goal: value }))}>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="1" id="r1" className="border-jewelBlack"/>
                                        <Label htmlFor="r1">Improve my daily productivity</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="2" id="r2" className="border-jewelBlack"/>
                                        <Label htmlFor="r2">Monitor my work progress & identify areas of improvement</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="3" id="r3" className="border-jewelBlack"/>
                                        <Label htmlFor="r3">Cultivate mindfulness and improve interpersonal interactions</Label>
                                    </div>
                                </div>
                            </RadioGroup>
                        )}

                        {step === 4 && (
                            <RadioGroup defaultValue="comfortable" onValueChange={(value) => setFormData(prev => ({ ...prev, emailFrequency: value }))}>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="1" id="r1" className="border-jewelBlack"/>
                                        <Label htmlFor="r1">Weekly</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="2" id="r2" className="border-jewelBlack"/>
                                        <Label htmlFor="r2">Bi-weekly</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="3" id="r3" className="border-jewelBlack"/>
                                        <Label htmlFor="r3">Monthly</Label>
                                    </div>
                                </div>
                            </RadioGroup>
                        )}
                        <div className="flex justify-between">
                            {step > 1 && (
                                <Button type="button" onClick={handlePrev} variant="outline" className="p-4 text-jewelBlack">
                                    Previous
                                </Button>
                            )}
                            {step < 4 ? (
                                <Button type="button" onClick={handleNextStep} className="p-4 text-jewelBlack">
                                    Continue
                                </Button>
                            ) : (
                                <Button type="submit" className="p-4 text-jewelBlack" onClick={async () => {
                                    handleNextStep()
                                }}>
                                    Submit
                                </Button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
            <footer className="p-4 absolute bottom-0 left-0 right-0">
                <div className="w-full bg-gray-200 h-2">
                    <div
                        className="bg-jewelPrimary h-2 transition-all duration-300 ease-in-out"
                        style={{ width: `${(step / 4) * 100}%` }}
                    ></div>
                </div>
            </footer>
        </div>
    );
}