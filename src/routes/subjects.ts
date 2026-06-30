import express from 'express';
import { db } from '../db/index.js';
import { departments, subjects } from '../db/schema/app.js';
import { and, eq, getTableColumns, ilike, or, sql } from 'drizzle-orm';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { search, department, page = 1, limit = 10 } = req.query;

        const currentPage = Math.max(1, parseInt(String(page), 10) || 1);
        const limitPerPage = Math.max(1, parseInt(String(limit), 10) || 10);

        const offset = (currentPage - 1) * limitPerPage;

        const filterConditions = [];

        if (search) {
            filterConditions.push(
                or(
                    ilike(subjects.name, `%${search}%`),
                    ilike(subjects.code, `%${search}%`)
                )
            )
        };

        if (department) {
            const deptPattern =
                `%${String(department).replace(/[%_\\]/g, '\\$&')}%`;

            filterConditions.push(
                ilike(departments.name, deptPattern)
            );
        }

        const whereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined;

        const countResult = await db
            .select({ count: sql`count(*)` })
            .from(subjects)
            .leftJoin(departments, eq(departments.id, subjects.departmentId))
            .where(whereClause);

        const totalCount = countResult[0]?.count ?? 0;

        const subjectsList = await db
            .select({ ...getTableColumns(subjects), department: { ...getTableColumns(departments) } })
            .from(subjects)
            .leftJoin(departments, eq(subjects.departmentId, departments.id))
            .orderBy(subjects.createdAt)
            .limit(limitPerPage)
            .offset(offset)
            .where(whereClause)

        res.status(200).json({
            data: subjectsList,
            pagination: {
                page: currentPage,
                total: totalCount,
                limit: limitPerPage,
                totalPages: Math.ceil(totalCount / limitPerPage)
            }
        })
    } catch (error) {
        res.status(500).json({ error: 'Failed to get subjects' })
    }
});



export { router as subjectsRouter };