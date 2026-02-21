const fs = require('fs');
const path = require('path');

// Mock Skills
const TECH_SKILLS = [
    "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Python", "Java", "C++", "C#",
    "SQL", "PostgreSQL", "MongoDB", "AWS", "Docker", "Kubernetes", "Git", "HTML", "CSS",
    "Tailwind", "Prisma", "GraphQL", "Redux", "Data Analysis", "Machine Learning", "AI"
];

// Mock Resume Text
const mockResumeText = `
John Doe
Software Engineer
Experienced in building web applications using React, Next.js, and Node.js.
Proficient in TypeScript and Tailwind CSS.
Familiar with PostgreSQL and Prisma for database management.
Looking for a Full Stack Developer role.
`;

console.log("Analyzing Mock Resume...");

// 1. Extract Skills
const lowerText = mockResumeText.toLowerCase();
const extractedSkills = TECH_SKILLS.filter(skill =>
    lowerText.includes(skill.toLowerCase())
);

console.log("Extracted Skills:", extractedSkills);

if (extractedSkills.includes("React") && extractedSkills.includes("Node.js")) {
    console.log("SUCCESS: Core skills extracted correctly.");
} else {
    console.error("FAILURE: Failed to extract core skills.");
}

// 2. Mock Job Matching (to verify logic)
const mockJobs = [
    { title: "Frontend Dev", requirements: "React, TypeScript, Tailwind" },
    { title: "Backend Dev", requirements: "Node.js, PostgreSQL, Docker" },
    { title: "Data Scientist", requirements: "Python, Machine Learning, AI" }
];

console.log("\nMatching Jobs...");
const matchedJobs = mockJobs.map(job => {
    const jobText = (job.title + " " + job.requirements).toLowerCase();
    const jobSkills = TECH_SKILLS.filter(s => jobText.includes(s.toLowerCase()));
    const intersection = jobSkills.filter(s => extractedSkills.includes(s));
    const matchScore = jobSkills.length > 0
        ? Math.round((intersection.length / jobSkills.length) * 100)
        : 0;

    return { title: job.title, matchScore, matchedSkills: intersection };
}).sort((a, b) => b.matchScore - a.matchScore);

console.log("Top Match:", matchedJobs[0]);

if (matchedJobs[0].title === "Frontend Dev") {
    console.log("SUCCESS: Job matching logic works.");
} else {
    console.error("FAILURE: Job matching logic failed.");
}
