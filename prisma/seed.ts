
import { PrismaClient, Role, JobType, WorkMode, EventType, RequestStatus } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding ...')

    // Clean up existing data (optional, be careful in production)
    // await prisma.notification.deleteMany()
    // await prisma.feedback.deleteMany()
    // await prisma.story.deleteMany()
    // await prisma.connection.deleteMany()
    // await prisma.mentorshipRequest.deleteMany()
    // await prisma.eventRegistration.deleteMany()
    // await prisma.jobApplication.deleteMany()
    // await prisma.event.deleteMany()
    // await prisma.job.deleteMany()
    // await prisma.profile.deleteMany()
    // await prisma.user.deleteMany()

    const hashedPassword = await bcrypt.hash('password123', 10)

    // 1. Create Users

    // Student
    const student = await prisma.user.upsert({
        where: { email: 'student@example.com' },
        update: {},
        create: {
            email: 'student@example.com',
            name: 'Alex Student',
            password: hashedPassword,
            role: Role.STUDENT,
            isVerified: true,
            profile: {
                create: {
                    headline: 'Aspiring Full Stack Developer',
                    bio: 'Computer Science student passionate about building scalable web applications.',
                    city: 'New York',
                    country: 'USA',
                    skills: ['React', 'Next.js', 'Node.js', 'TypeScript'],
                    batch: '2025',
                    department: 'Computer Science',
                    github: 'https://github.com/alexstudent',
                    linkedin: 'https://linkedin.com/in/alexstudent'
                }
            }
        },
    })

    // Alumni
    const alumni = await prisma.user.upsert({
        where: { email: 'alumni@example.com' },
        update: {},
        create: {
            email: 'alumni@example.com',
            name: 'Sarah Alumni',
            password: hashedPassword,
            role: Role.ALUMNI,
            isVerified: true,
            profile: {
                create: {
                    headline: 'Senior Software Engineer at TechCorp',
                    bio: 'Experienced backend developer with 5 years of experience in distributed systems.',
                    city: 'San Francisco',
                    country: 'USA',
                    skills: ['Java', 'Spring Boot', 'AWS', 'System Design'],
                    batch: '2020',
                    department: 'Computer Science',
                    currentRole: 'Senior Software Engineer',
                    company: 'TechCorp',
                    industry: 'Technology',
                    linkedin: 'https://linkedin.com/in/sarahalumni'
                }
            }
        },
    })

    // Admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            name: 'Admin User',
            password: hashedPassword,
            role: Role.ADMIN,
            isVerified: true,
        },
    })

    // 2. Create Jobs (Posted by Alumni)
    const job1 = await prisma.job.create({
        data: {
            title: 'Frontend Developer Intern',
            company: 'TechCorp',
            location: 'Remote',
            type: JobType.INTERNSHIP,
            workMode: WorkMode.REMOTE,
            description: 'We are looking for a passionate Frontend Intern to join our team. You will work with React and Next.js.',
            requirements: 'Knowledge of HTML, CSS, JavaScript, and React.',
            salaryRange: '$20/hr - $30/hr',
            postedById: alumni.id
        }
    })

    const job2 = await prisma.job.create({
        data: {
            title: 'Junior Backend Engineer',
            company: 'StartupInc',
            location: 'San Francisco, CA',
            type: JobType.FULL_TIME,
            workMode: WorkMode.ONSITE,
            description: 'Join our fast-paced startup as a Junior Backend Engineer.',
            requirements: 'Experience with Node.js and PostgreSQL.',
            postedById: alumni.id
        }
    })

    // 3. Create Events (Posted by Alumni)
    const event1 = await prisma.event.create({
        data: {
            title: 'Tech Talk: Scaling Microservices',
            description: 'Join us for a deep dive into microservices architecture.',
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            type: EventType.WEBINAR,
            location: 'Zoom',
            link: 'https://zoom.us/j/123456789',
            postedById: alumni.id,
            isApproved: true
        }
    })

    const event2 = await prisma.event.create({
        data: {
            title: 'Alumni Networking Night',
            description: 'Connect with fellow alumni and current students.',
            date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
            type: EventType.MEETUP,
            location: 'Campus Auditorium',
            postedById: alumni.id,
            isApproved: true
        }
    })

    // 4. Create Mentorship Requests
    await prisma.mentorshipRequest.create({
        data: {
            menteeId: student.id,
            mentorId: alumni.id,
            message: 'I would love to learn more about backend engineering at TechCorp.',
            status: RequestStatus.PENDING
        }
    })

    // 5. Job Applications
    await prisma.jobApplication.create({
        data: {
            studentId: student.id,
            jobId: job1.id,
            status: RequestStatus.PENDING
        }
    })

    // 6. Event Registrations
    await prisma.eventRegistration.create({
        data: {
            userId: student.id,
            eventId: event1.id
        }
    })

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
