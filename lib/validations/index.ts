import { z } from "zod";

export const profileSchema = z.object({
    bio: z.string().max(500).optional(),
    headline: z.string().max(100).optional(),
    city: z.string().min(2).optional(),
    country: z.string().min(2).optional(),
    skills: z.array(z.string()).optional(),
    interests: z.array(z.string()).optional(),
    linkedin: z.string().url().optional().or(z.literal("")),
    github: z.string().url().optional().or(z.literal("")),
    twitter: z.string().url().optional().or(z.literal("")),
    website: z.string().url().optional().or(z.literal("")),
    // Student
    batch: z.string().optional(),
    department: z.string().optional(),
    rollNumber: z.string().optional(),
    // Alumni
    currentRole: z.string().optional(),
    company: z.string().optional(),
    industry: z.string().optional(),
});

export const jobSchema = z.object({
    title: z.string().min(3),
    company: z.string().min(2),
    description: z.string().min(10),
    location: z.string().min(2),
    type: z.enum(["FULL_TIME", "INTERNSHIP", "CONTRACT", "FREELANCE"]),
    workMode: z.enum(["REMOTE", "HYBRID", "ONSITE"]),
    salaryRange: z.string().optional(),
    requirements: z.string().optional(),
});

export const eventSchema = z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    date: z.string().datetime(), // ISO string
    location: z.string().optional(),
    link: z.string().url().optional().or(z.literal("")),
    type: z.enum(["WEBINAR", "WORKSHOP", "MEETUP", "CONFERENCE"]),
});

export const mentorshipRequestSchema = z.object({
    mentorId: z.string(),
    message: z.string().optional(),
});
