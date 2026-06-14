import { NextRequest, NextResponse } from 'next/server';
// Assuming the application uses its standard database client (e.g., Prisma or pg pool)
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  // Get the 'nrp' parameter from the query string (?nrp=...)
  const { searchParams } = new URL(request.url);
  const nrp = searchParams.get('nrp');

  // Check: Is the nrp parameter present?
  if (!nrp) 
  {
    return NextResponse.json(
      { success: false, message: 'NRP is required' },
      { status: 400 }
    );
  }

  // Ensure the NRP format is a 10-digit number
  const isNumeric = /^\d+$/.test(nrp);
  if (nrp.length !== 10 || !isNumeric) 
  {
    return NextResponse.json(
      { success: false, message: 'Invalid NRP/Student ID format, enter a 10-digit number' },
      { status: 400 }
    );
  }

  try {
    // Securely query the database
    const query = 'SELECT gugus, region FROM mahasiswa_baru WHERE nrp = $1';
    const result = await db.query(query, [nrp]);

    // Check if the student data is exist and found
    if (result.rowCount > 0) 
    {
      const dataMaba = result.rows[0];
      
      return NextResponse.json(
        {
          success: true,
          data: {
            nrp: nrp,
            gugus: dataMaba.gugus,
            region: dataMaba.region
          }
        },
        { status: 200 }
      );
    } else 
      {
        // If the NRP is not registered in the database
        return NextResponse.json(
          { success: false, message: 'NRP not found or not registered' },
          { status: 404 }
        );
      }

  } catch (error) 
    {
      // To handle internal bugs if the database goes down or resulted in an error
      console.error('Database runtime error on Gugus Checker:', error);
  
      return NextResponse.json(
        { success: false, message: 'An internal server error occurred' },
        { status: 500 }
      );
    }
}