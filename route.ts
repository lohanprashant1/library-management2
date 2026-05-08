import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/transactions
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || '';
    const memberId = searchParams.get('memberId') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (memberId) where.memberId = memberId;

    const [transactions, total] = await Promise.all([
      db.transaction.findMany({
        where,
        include: {
          book: { include: { category: true, author: true } },
          member: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.transaction.count({ where }),
    ]);

    return NextResponse.json({ transactions, total, page, limit });
  } catch (error) {
    console.error('Transactions GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

// POST /api/transactions - Issue a book
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookId, memberId, dueDate, remarks } = body;

    if (!bookId || !memberId) {
      return NextResponse.json({ error: 'Book ID and Member ID are required' }, { status: 400 });
    }

    // Check book availability
    const book = await db.book.findUnique({ where: { id: bookId } });
    if (!book || book.availableCopies <= 0) {
      return NextResponse.json({ error: 'Book is not available' }, { status: 400 });
    }

    // Check member status
    const member = await db.member.findUnique({ where: { id: memberId } });
    if (!member || member.status !== 'Active') {
      return NextResponse.json({ error: 'Member is not active' }, { status: 400 });
    }

    // Check member's active issues
    const activeIssues = await db.transaction.count({
      where: { memberId, status: 'Issued' },
    });

    const settings = await db.settings.findUnique({ where: { id: 'default' } });
    const maxBooks = settings?.maxBooksPerMember || 5;

    if (activeIssues >= maxBooks) {
      return NextResponse.json(
        { error: `Member has reached maximum book limit (${maxBooks})` },
        { status: 400 }
      );
    }

    // Check if member already has this book
    const existingTransaction = await db.transaction.findFirst({
      where: { bookId, memberId, status: 'Issued' },
    });
    if (existingTransaction) {
      return NextResponse.json({ error: 'Member already has this book issued' }, { status: 400 });
    }

    const defaultDueDate = new Date();
    const maxDays = settings?.maxLoanDays || 14;
    defaultDueDate.setDate(defaultDueDate.getDate() + maxDays);

    const transaction = await db.transaction.create({
      data: {
        bookId,
        memberId,
        issueDate: new Date(),
        dueDate: dueDate ? new Date(dueDate) : defaultDueDate,
        status: 'Issued',
        remarks: remarks || '',
      },
      include: {
        book: { include: { category: true, author: true } },
        member: true,
      },
    });

    // Update book availability
    await db.book.update({
      where: { id: bookId },
      data: { availableCopies: { decrement: 1 } },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('Transactions POST error:', error);
    return NextResponse.json({ error: 'Failed to issue book' }, { status: 500 });
  }
}

// PUT /api/transactions - Return a book
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, returnDate, fineAmount, remarks } = body;

    if (!id) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }

    const transaction = await db.transaction.findUnique({
      where: { id },
      include: { book: true },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (transaction.status === 'Returned') {
      return NextResponse.json({ error: 'Book already returned' }, { status: 400 });
    }

    const updated = await db.transaction.update({
      where: { id },
      data: {
        returnDate: returnDate ? new Date(returnDate) : new Date(),
        status: 'Returned',
        fineAmount: fineAmount || 0,
        remarks: remarks || transaction.remarks,
      },
      include: {
        book: { include: { category: true, author: true } },
        member: true,
      },
    });

    // Update book availability
    await db.book.update({
      where: { id: transaction.bookId },
      data: { availableCopies: { increment: 1 } },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Transactions PUT error:', error);
    return NextResponse.json({ error: 'Failed to return book' }, { status: 500 });
  }
}

// DELETE /api/transactions?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }
    const transaction = await db.transaction.findUnique({ where: { id } });
    if (transaction && transaction.status === 'Issued') {
      return NextResponse.json({ error: 'Cannot delete an active transaction' }, { status: 400 });
    }
    await db.transaction.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Transactions DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
}
