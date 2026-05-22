import { Router } from 'express';
import { db } from './db.js';

const router = Router();

/**
 * 4-1. GET /api/posts
 * - 게시글 목록 조회 및 검색 (페이징 연산 포함)
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string || '').trim();

    const offset = (page - 1) * limit;

    let postsQuery = 'SELECT * FROM posts';
    let countQuery = 'SELECT COUNT(*) as count FROM posts';
    const queryArgs: any[] = [];

    // 검색어가 있으면 필터링 쿼리 적용
    if (search) {
      const searchPattern = `%${search}%`;
      postsQuery += ' WHERE title LIKE ? OR content LIKE ?';
      countQuery += ' WHERE title LIKE ? OR content LIKE ?';
      queryArgs.push(searchPattern, searchPattern);
    }

    // 최신글이 상단에 오도록 정렬하고 페이징 처리 적용
    postsQuery += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    const postsArgs = [...queryArgs, limit, offset];

    // 데이터 조회 및 전체 카운트 병렬 실행
    const [postsResult, countResult] = await Promise.all([
      db.execute({ sql: postsQuery, args: postsArgs }),
      db.execute({ sql: countQuery, args: queryArgs })
    ]);

    const total = Number(countResult.rows[0]?.count || 0);
    const totalPages = Math.ceil(total / limit);

    return res.json({
      success: true,
      posts: postsResult.rows,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    console.error('[API-GetPosts] 게시글 목록 조회 오류:', error);
    return res.status(500).json({ success: false, error: '게시글 목록을 불러오는 도중 오류가 발생했습니다.' });
  }
});

/**
 * 4-2. GET /api/posts/:id
 * - 특정 게시글 상세 조회 및 조회수(views) 1 증가 처리
 */
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: '유효하지 않은 게시글 번호입니다.' });
    }

    // 1. 조회수 1 증가 처리 (원자적 업데이트)
    await db.execute({
      sql: 'UPDATE posts SET views = views + 1 WHERE id = ?',
      args: [id]
    });

    // 2. 게시글 상세 조회
    const result = await db.execute({
      sql: 'SELECT * FROM posts WHERE id = ?',
      args: [id]
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: '존재하지 않거나 삭제된 게시글입니다.' });
    }

    return res.json({
      success: true,
      post: result.rows[0]
    });
  } catch (error) {
    console.error('[API-GetPostDetail] 게시글 상세 조회 오류:', error);
    return res.status(500).json({ success: false, error: '게시글 상세 정보를 불러오는 도중 오류가 발생했습니다.' });
  }
});

/**
 * 4-3. POST /api/posts
 * - 새 게시글 등록
 */
router.post('/', async (req, res) => {
  try {
    const { title, author, content, category } = req.body;

    // 유효성 검사
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: '제목을 입력해 주세요.' });
    }
    if (!author || !author.trim()) {
      return res.status(400).json({ success: false, error: '작성자를 입력해 주세요.' });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: '본문 내용을 입력해 주세요.' });
    }

    // 데이터 삽입
    const insertResult = await db.execute({
      sql: 'INSERT INTO posts (title, author, content, category) VALUES (?, ?, ?, ?)',
      args: [title.trim(), author.trim(), content.trim(), (category || '일반').trim()]
    });

    // SQLite/LibSQL에서 마지막 삽입된 Row ID 추출 (insertedId 혹은 insertId)
    // insertResult.lastInsertRowid 값을 리턴합니다.
    const newId = Number(insertResult.lastInsertRowid);

    return res.status(201).json({
      success: true,
      message: '게시글이 성공적으로 등록되었습니다.',
      id: newId
    });
  } catch (error) {
    console.error('[API-CreatePost] 게시글 등록 오류:', error);
    return res.status(500).json({ success: false, error: '게시글을 등록하는 도중 오류가 발생했습니다.' });
  }
});

/**
 * 4-4. PUT /api/posts/:id
 * - 기존 등록된 게시글의 제목, 내용, 카테고리 정보 수정
 */
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, content, category } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: '유효하지 않은 게시글 번호입니다.' });
    }

    // 유효성 검사
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: '제목을 입력해 주세요.' });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: '본문 내용을 입력해 주세요.' });
    }

    // 게시글 존재 여부 우선 확인
    const checkExist = await db.execute({
      sql: 'SELECT id FROM posts WHERE id = ?',
      args: [id]
    });
    if (checkExist.rows.length === 0) {
      return res.status(404).json({ success: false, error: '존재하지 않는 게시글입니다.' });
    }

    // 수정 쿼리 실행
    await db.execute({
      sql: 'UPDATE posts SET title = ?, content = ?, category = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      args: [title.trim(), content.trim(), (category || '일반').trim(), id]
    });

    return res.json({
      success: true,
      message: '게시글이 성공적으로 수정되었습니다.'
    });
  } catch (error) {
    console.error('[API-UpdatePost] 게시글 수정 오류:', error);
    return res.status(500).json({ success: false, error: '게시글을 수정하는 도중 오류가 발생했습니다.' });
  }
});

/**
 * 4-5. DELETE /api/posts/:id
 * - 특정 게시글 영구 삭제
 */
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: '유효하지 않은 게시글 번호입니다.' });
    }

    // 게시글 존재 여부 확인
    const checkExist = await db.execute({
      sql: 'SELECT id FROM posts WHERE id = ?',
      args: [id]
    });
    if (checkExist.rows.length === 0) {
      return res.status(404).json({ success: false, error: '존재하지 않는 게시글입니다.' });
    }

    // 삭제 실행
    await db.execute({
      sql: 'DELETE FROM posts WHERE id = ?',
      args: [id]
    });

    return res.json({
      success: true,
      message: '게시글이 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error('[API-DeletePost] 게시글 삭제 오류:', error);
    return res.status(500).json({ success: false, error: '게시글을 삭제하는 도중 오류가 발생했습니다.' });
  }
});

export default router;
