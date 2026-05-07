
export interface LinkedInProfile {
    name: string;
    headline: string;
    about: string;
    education: string[];
    qualifications: string[];
    profileUrl: string;
}

export async function getLinkedInProfile(url: string): Promise<LinkedInProfile | null> {
    const profileId = url.split('/in/')[1]?.split('/')[0]?.split('?')[0];
    
    if (!profileId) return null;

    const lowerId = profileId.toLowerCase();

    // Comprehensive mock profiles for demonstration
    const mocks: Record<string, LinkedInProfile> = {
        'maha17': {
            name: "Mahalakshmi Y",
            headline: "Software Engineer & AI Enthusiast | BE CSE Student at KVCET",
            about: "Dynamic Computer Science Engineering student with a focus on Full Stack Development and AI. Proven track record of solving 500+ problems on LeetCode and building scalable web applications. Passionate about leveraging technology to solve educational and community challenges.",
            education: [
                "B.E. in Computer Science and Engineering - Karpaga Vinayaga College of Engineering and Technology (2022-2026)",
                "Specialization in Machine Learning and Data Structures"
            ],
            qualifications: [
                "Full Stack Web Development - Udemy Certified",
                "Advanced Python for Data Science",
                "Consistent 'Knight' rank on LeetCode",
                "Technical Stack: React, Next.js, Node.js, Python, PostgreSQL"
            ],
            profileUrl: url
        },
        'lokesh-m-dev': {
            name: "Lokesh M",
            headline: "Senior Full Stack Developer | Next.js Expert | Alumni Mentor",
            about: "Experienced Software Architect with over 5 years in the industry. Specializing in high-performance web architectures and AI integration. Dedicated to mentoring the next generation of engineers.",
            education: [
                "B.E. in Computer Science - KVCET Alumni",
                "M.S. in Software Systems - BITS Pilani"
            ],
            qualifications: [
                "AWS Certified Solutions Architect",
                "Expert in Microservices & Cloud Native Apps",
                "Open Source Contributor to Next.js and Prisma"
            ],
            profileUrl: url
        }
    };

    if (mocks[lowerId]) return mocks[lowerId];

    // Professional Fallback
    return {
        name: profileId.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
        headline: "Technology Professional | Industry Specialist",
        about: "A seasoned professional with extensive experience in the technology sector, focused on driving innovation and achieving strategic goals through technical excellence.",
        education: ["Higher Education in Specialized Technical Domain"],
        qualifications: ["Core Competencies: Strategy, Technical Leadership, Problem Solving"],
        profileUrl: url
    };
}
