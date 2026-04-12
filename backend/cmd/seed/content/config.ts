// src/content/config.ts
import { defineCollection, z } from 'astro:content';
import path from 'node:path'; // <-- Importa 'path' de Node

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),        // <<— importante
    author: z.string(),
    image: z.object({
      url: z.string(),
      alt: z.string(),
    }).optional(),
    tags: z.array(z.string()),
    externalUrl: z.string().url().optional(), 
  }),
});

export const collections = { blog: blogCollection };
