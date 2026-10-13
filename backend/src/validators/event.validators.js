import { z } from 'zod';

export const createEventSchema = z.object({
  body: z.object({
    title: z.string().trim().min(3, 'Title must be at least 3 characters'),
    categoryId: z.string().trim().min(1, 'Category is required'),
    summary: z.string().trim().optional().default(''),
    description: z.string().trim().optional().default(''),
    coverImageUrl: z.string().url().optional().nullable().default('https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'),
    startDatetime: z.string().min(1, 'Start date and time are required'),
    endDatetime: z.string().min(1, 'End date and time are required'),
    venueName: z.string().trim().min(1, 'Venue name is required'),
    address: z.string().trim().optional().nullable().default(''),
    city: z.string().trim().min(1, 'City is required'),
    eventType: z.enum(['in-person', 'virtual', 'hybrid']).default('in-person'),
    capacity: z.coerce.number().int().positive('Capacity must be a positive integer'),
    price: z.coerce.number().min(0, 'Price cannot be negative').default(0),
    currency: z.string().trim().default('USD'),
    status: z.enum(['draft', 'published', 'cancelled', 'past']).default('published'),
    featured: z.coerce.boolean().default(false)
  }).refine(data => new Date(data.endDatetime) >= new Date(data.startDatetime), {
    message: 'End date and time must be after or equal to start date and time',
    path: ['endDatetime']
  })
});

export const updateEventSchema = z.object({
  body: z.object({
    title: z.string().trim().min(3, 'Title must be at least 3 characters').optional(),
    categoryId: z.string().trim().min(1, 'Category is required').optional(),
    summary: z.string().trim().optional(),
    description: z.string().trim().optional(),
    coverImageUrl: z.string().url().optional().nullable(),
    startDatetime: z.string().optional(),
    endDatetime: z.string().optional(),
    venueName: z.string().trim().min(1, 'Venue name is required').optional(),
    address: z.string().trim().optional().nullable(),
    city: z.string().trim().min(1, 'City is required').optional(),
    eventType: z.enum(['in-person', 'virtual', 'hybrid']).optional(),
    capacity: z.coerce.number().int().positive('Capacity must be a positive integer').optional(),
    price: z.coerce.number().min(0, 'Price cannot be negative').optional(),
    currency: z.string().trim().optional(),
    status: z.enum(['draft', 'published', 'cancelled', 'past']).optional(),
    featured: z.coerce.boolean().optional()
  })
});

export const updateEventStatusSchema = z.object({
  body: z.object({
    status: z.enum(['draft', 'published', 'cancelled', 'past'], {
      required_error: 'Valid status is required'
    })
  })
});

export const listEventsQuerySchema = z.object({
  query: z.object({
    search: z.string().trim().optional(),
    category: z.string().trim().optional(),
    city: z.string().trim().optional(),
    eventType: z.string().trim().optional(),
    priceType: z.enum(['all', 'free', 'paid']).optional().default('all'),
    dateFilter: z.enum(['all', 'today', 'upcoming', 'past']).optional().default('upcoming'),
    sort: z.enum(['upcoming', 'newest', 'popular']).optional().default('upcoming'),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20)
  })
});
