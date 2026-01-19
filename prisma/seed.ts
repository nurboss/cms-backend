import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.document.deleteMany();
  await prisma.contentType.deleteMany();
  await prisma.sliceDefinition.deleteMany();
  await prisma.asset.deleteMany();

  console.log("✅ Cleared existing data");

  // Create content types
  const pageContentType = await prisma.contentType.create({
    data: {
      name: "page",
      description: "Basic page content type",
      schema: {
        fields: [
          {
            id: "title",
            type: "text",
            label: "Title",
            required: true,
            config: { placeholder: "Enter page title" },
          },
          {
            id: "uid",
            type: "uid",
            label: "URL Slug",
            required: true,
            config: { placeholder: "url-slug" },
          },
          {
            id: "metaDescription",
            type: "text",
            label: "Meta Description",
            config: { placeholder: "SEO description" },
          },
          {
            id: "metaTitle",
            type: "text",
            label: "Meta Title",
            config: { placeholder: "SEO title" },
          },
        ],
      },
    },
  });

  const blogContentType = await prisma.contentType.create({
    data: {
      name: "blog_post",
      description: "Blog post content type",
      schema: {
        fields: [
          {
            id: "title",
            type: "text",
            label: "Title",
            required: true,
          },
          {
            id: "uid",
            type: "uid",
            label: "URL Slug",
            required: true,
          },
          {
            id: "excerpt",
            type: "text",
            label: "Excerpt",
            config: { multiline: true },
          },
          {
            id: "author",
            type: "text",
            label: "Author",
          },
          {
            id: "publishedDate",
            type: "date",
            label: "Published Date",
          },
          {
            id: "featuredImage",
            type: "image",
            label: "Featured Image",
          },
          {
            id: "category",
            type: "select",
            label: "Category",
            config: {
              options: ["Technology", "Design", "Business", "Personal"],
            },
          },
        ],
      },
    },
  });

  console.log("✅ Created content types");

  // Create slice definitions
  const heroSlice = await prisma.sliceDefinition.create({
    data: {
      sliceType: "hero",
      name: "Hero Section",
      description: "Full-width hero section with title, subtitle, and CTA",
      schema: {
        primary: [
          {
            id: "title",
            type: "text",
            label: "Title",
            required: true,
            config: { placeholder: "Hero title" },
          },
          {
            id: "subtitle",
            type: "text",
            label: "Subtitle",
            config: { multiline: true, placeholder: "Hero subtitle" },
          },
          {
            id: "backgroundImage",
            type: "image",
            label: "Background Image",
            config: { constraint: { width: 1920, height: 1080 } },
          },
          {
            id: "ctaText",
            type: "text",
            label: "CTA Text",
            config: { placeholder: "Button text" },
          },
          {
            id: "ctaLink",
            type: "text",
            label: "CTA Link",
            config: { placeholder: "/path-or-url" },
          },
          {
            id: "alignment",
            type: "select",
            label: "Content Alignment",
            config: {
              options: ["left", "center", "right"],
            },
          },
        ],
      },
    },
  });

  const gallerySlice = await prisma.sliceDefinition.create({
    data: {
      sliceType: "gallery",
      name: "Image Gallery",
      description: "Grid of images with captions",
      schema: {
        primary: [
          {
            id: "title",
            type: "text",
            label: "Gallery Title",
            config: { placeholder: "Gallery title" },
          },
          {
            id: "columns",
            type: "number",
            label: "Columns",
            config: { min: 1, max: 4, defaultValue: 3 },
          },
          {
            id: "spacing",
            type: "number",
            label: "Spacing",
            config: { min: 0, max: 10, defaultValue: 4 },
          },
        ],
        items: [
          {
            id: "image",
            type: "image",
            label: "Image",
            required: true,
            config: { constraint: { width: 800, height: 600 } },
          },
          {
            id: "caption",
            type: "text",
            label: "Caption",
            config: { placeholder: "Image caption" },
          },
          {
            id: "link",
            type: "text",
            label: "Link",
            config: { placeholder: "/path-or-url" },
          },
          {
            id: "description",
            type: "rich_text",
            label: "Description",
            config: { placeholder: "Detailed description" },
          },
        ],
      },
    },
  });

  const textSlice = await prisma.sliceDefinition.create({
    data: {
      sliceType: "text",
      name: "Text Content",
      description: "Rich text content block",
      schema: {
        primary: [
          {
            id: "content",
            type: "rich_text",
            label: "Content",
            required: true,
            config: { placeholder: "Enter your content here..." },
          },
          {
            id: "alignment",
            type: "select",
            label: "Alignment",
            config: {
              options: ["left", "center", "right", "justify"],
              defaultValue: "left",
            },
          },
          {
            id: "maxWidth",
            type: "number",
            label: "Max Width (px)",
            config: { min: 400, max: 1200, defaultValue: 800 },
          },
          {
            id: "backgroundColor",
            type: "text",
            label: "Background Color",
            config: { placeholder: "#ffffff" },
          },
        ],
      },
    },
  });

  const featuresSlice = await prisma.sliceDefinition.create({
    data: {
      sliceType: "features",
      name: "Features Grid",
      description: "Grid of features with icons and descriptions",
      schema: {
        primary: [
          {
            id: "title",
            type: "text",
            label: "Section Title",
            config: { placeholder: "Our Features" },
          },
          {
            id: "subtitle",
            type: "text",
            label: "Section Subtitle",
            config: { multiline: true },
          },
        ],
        items: [
          {
            id: "icon",
            type: "text",
            label: "Icon Name",
            config: { placeholder: "check-circle" },
          },
          {
            id: "title",
            type: "text",
            label: "Feature Title",
            required: true,
          },
          {
            id: "description",
            type: "rich_text",
            label: "Feature Description",
            required: true,
          },
          {
            id: "link",
            type: "text",
            label: "Learn More Link",
          },
        ],
      },
    },
  });

  console.log("✅ Created slice definitions");

  // Create sample documents
  const homePage = await prisma.document.create({
    data: {
      uid: "home",
      title: "Home Page",
      contentType: "page",
      status: "published",
      publishedAt: new Date(),
      data: {
        title: "Welcome to Our Headless CMS",
        uid: "home",
        metaDescription:
          "A production-ready, self-hosted headless CMS similar to Prismic",
        metaTitle: "Home | Headless CMS",
        body: [
          {
            slice_type: "hero",
            slice_label: "Main Hero",
            primary: {
              title: "Welcome to Our CMS",
              subtitle:
                "A Prismic-like headless CMS built with modern technologies. Self-hosted, extensible, and developer-friendly.",
              backgroundImage: "/uploads/hero-bg.jpg",
              ctaText: "Get Started",
              ctaLink: "/about",
              alignment: "center",
            },
          },
          {
            slice_type: "text",
            slice_label: "Introduction",
            primary: {
              content:
                "<h2>About Our Platform</h2><p>This is a production-ready headless CMS that you can self-host. It features slice-based content modeling, similar to Prismic, with a modern tech stack including Next.js, Express, and PostgreSQL.</p><p>Built with TypeScript for type safety and extensibility.</p>",
              alignment: "center",
              maxWidth: 800,
              backgroundColor: "#f9fafb",
            },
          },
          {
            slice_type: "features",
            slice_label: "Key Features",
            primary: {
              title: "Why Choose Our CMS",
              subtitle: "Powerful features for modern web development",
            },
            items: [
              {
                icon: "code",
                title: "Slice-Based Architecture",
                description:
                  "<p>Create reusable content blocks with custom schemas</p>",
                link: "/docs/slices",
              },
              {
                icon: "database",
                title: "JSON-Based Storage",
                description:
                  "<p>Flexible content storage using PostgreSQL JSONB</p>",
                link: "/docs/storage",
              },
              {
                icon: "git-branch",
                title: "Headless API",
                description:
                  "<p>RESTful API for content delivery to any frontend</p>",
                link: "/docs/api",
              },
              {
                icon: "shield",
                title: "Self-Hosted",
                description:
                  "<p>Full control over your data and infrastructure</p>",
                link: "/docs/hosting",
              },
            ],
          },
        ],
      },
    },
  });

  const aboutPage = await prisma.document.create({
    data: {
      uid: "about",
      title: "About Us",
      contentType: "page",
      status: "published",
      publishedAt: new Date(),
      data: {
        title: "About Our Company",
        uid: "about",
        metaDescription: "Learn more about our company and mission",
        metaTitle: "About | Headless CMS",
        body: [
          {
            slice_type: "text",
            slice_label: "About Content",
            primary: {
              content:
                "<h1>About Us</h1><p>We are a team of developers passionate about building open-source tools for the modern web. Our mission is to make content management simple, flexible, and developer-friendly.</p><p>This CMS started as an internal tool and has grown into a full-featured platform that we're excited to share with the community.</p>",
              alignment: "left",
              maxWidth: 800,
            },
          },
          {
            slice_type: "gallery",
            slice_label: "Team Gallery",
            primary: {
              title: "Meet Our Team",
              columns: 3,
              spacing: 4,
            },
            items: [
              {
                image: "/uploads/team1.jpg",
                caption: "John Doe - CEO",
                link: "/team/john",
                description: "<p>Founder and lead developer</p>",
              },
              {
                image: "/uploads/team2.jpg",
                caption: "Jane Smith - CTO",
                link: "/team/jane",
                description: "<p>Technical architecture and infrastructure</p>",
              },
              {
                image: "/uploads/team3.jpg",
                caption: "Bob Johnson - Lead Developer",
                link: "/team/bob",
                description: "<p>Frontend and API development</p>",
              },
            ],
          },
        ],
      },
    },
  });

  const sampleBlog = await prisma.document.create({
    data: {
      uid: "getting-started-with-cms",
      title: "Getting Started with Our CMS",
      contentType: "blog_post",
      status: "published",
      publishedAt: new Date("2024-01-15"),
      data: {
        title: "Getting Started with Our Headless CMS",
        uid: "getting-started-with-cms",
        excerpt:
          "Learn how to set up and use our Prismic-like CMS for your next project",
        author: "Admin User",
        publishedDate: "2024-01-15",
        category: "Technology",
        featuredImage: "/uploads/blog-featured.jpg",
        body: [
          {
            slice_type: "text",
            slice_label: "Introduction",
            primary: {
              content:
                "<h1>Getting Started Guide</h1><p>Welcome to our headless CMS! This guide will help you set up and start using the CMS for your projects.</p><h2>Prerequisites</h2><ul><li>Node.js 18+</li><li>PostgreSQL 15+</li><li>Basic knowledge of React and Next.js</li></ul>",
              alignment: "left",
            },
          },
          {
            slice_type: "text",
            slice_label: "Installation",
            primary: {
              content:
                "<h2>Installation Steps</h2><ol><li>Clone the repository</li><li>Install dependencies with npm install</li><li>Set up your database</li><li>Run database migrations</li><li>Start the development servers</li></ol>",
              alignment: "left",
            },
          },
        ],
      },
    },
  });

  // Create a draft document
  const draftPage = await prisma.document.create({
    data: {
      uid: "services",
      title: "Our Services",
      contentType: "page",
      status: "draft",
      data: {
        title: "Our Services",
        uid: "services",
        metaDescription: "Services we offer",
        metaTitle: "Services | Headless CMS",
        body: [
          {
            slice_type: "text",
            slice_label: "Services Content",
            primary: {
              content:
                "<h1>Our Services</h1><p>This page is still under construction. Check back soon!</p>",
              alignment: "center",
            },
          },
        ],
      },
    },
  });

  console.log("✅ Created sample documents");

  // Create sample assets
  const sampleAssets = [
    {
      filename: "hero-bg.jpg",
      mimeType: "image/jpeg",
      url: "/uploads/hero-bg.jpg",
      size: 1024000,
      width: 1920,
      height: 1080,
      altText: "Hero background image",
    },
    {
      filename: "team1.jpg",
      mimeType: "image/jpeg",
      url: "/uploads/team1.jpg",
      size: 512000,
      width: 800,
      height: 600,
      altText: "John Doe - CEO",
    },
    {
      filename: "team2.jpg",
      mimeType: "image/jpeg",
      url: "/uploads/team2.jpg",
      size: 512000,
      width: 800,
      height: 600,
      altText: "Jane Smith - CTO",
    },
    {
      filename: "team3.jpg",
      mimeType: "image/jpeg",
      url: "/uploads/team3.jpg",
      size: 512000,
      width: 800,
      height: 600,
      altText: "Bob Johnson - Lead Developer",
    },
    {
      filename: "blog-featured.jpg",
      mimeType: "image/jpeg",
      url: "/uploads/blog-featured.jpg",
      size: 768000,
      width: 1200,
      height: 630,
      altText: "Featured blog image",
    },
  ];

  for (const assetData of sampleAssets) {
    await prisma.asset.create({
      data: assetData,
    });
  }

  console.log("✅ Created sample assets");

  console.log("\n🎉 Seeding completed!");
  console.log("\n📊 Created:");
  console.log(`   • ${await prisma.contentType.count()} content types`);
  console.log(`   • ${await prisma.sliceDefinition.count()} slice definitions`);
  console.log(`   • ${await prisma.document.count()} documents (1 draft)`);
  console.log(`   • ${await prisma.asset.count()} sample assets`);

  console.log("\n🔗 Sample UIDs:");
  console.log("   • Home page: /api/documents/home");
  console.log("   • About page: /api/documents/about");
  console.log("   • Blog post: /api/documents/getting-started-with-cms");
  console.log("   • Draft page: /api/documents/services?draft=true");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
