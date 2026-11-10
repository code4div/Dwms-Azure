import { NextResponse } from "next/server";
import {
  getAllChuteWallsFromDb,
  updateLinerInDb,
  getLinerHealthCountsFromDb,
  getAllPlantLinersFromDb,
  getPlantHealthDistributionFromDb,
  initDb,
} from "@/lib/db";
import { getChuteWallsForChute, getAllPlantLiners } from "@/lib/initialLinerData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const view = searchParams.get("view");
  const chute = searchParams.get("chute") || "CH-001";
  const junction = searchParams.get("junction") || undefined;
  const zone = searchParams.get("zone") || undefined;

  // Re-seed database if requested
  if (action === "seed" || action === "reset") {
    try {
      await initDb(true);
      const distribution = await getPlantHealthDistributionFromDb();
      const walls = await getAllChuteWallsFromDb(chute);
      return NextResponse.json({
        success: true,
        message: "Database seeded and synchronized with all 200 plant liners successfully.",
        database: process.env.DB_DATABASE || "DWMS_TestDB",
        walls,
        distribution,
      });
    } catch (err: any) {
      console.error("[API /api/liners] Error seeding database:", err);
      return NextResponse.json(
        {
          success: false,
          error: err?.message || "Failed to seed database",
          stack: err?.stack,
        },
        { status: 500 }
      );
    }
  }

  // 1. Report View: return all plant liners and status distribution across the facility
  if (view === "report" || view === "all") {
    try {
      const liners = await getAllPlantLinersFromDb({
        junctionId: junction,
        chuteId: chute === "All" ? undefined : chute,
        zone,
      });
      const distribution = await getPlantHealthDistributionFromDb();

      return NextResponse.json({
        success: true,
        source: "database",
        dialect: "postgres",
        database: process.env.DB_DATABASE || "DWMS_TestDB",
        liners,
        distribution,
        total: liners.length,
      });
    } catch (err: any) {
      console.error("[API /api/liners?view=report] Database query error, using static fallback:", err?.message || err);
      const allStatic = getAllPlantLiners();
      const mapped = allLinersToReportFormat(allStatic);

      return NextResponse.json({
        success: true,
        source: "fallback_static",
        warning: `Database connection error: ${err?.message || "Unknown error"}. Displaying cached fallback data.`,
        liners: mapped,
        distribution: {
          healthy: 58,
          monitor: 74,
          action: 61,
          critical: 4,
          imminent: 2,
          offline: 1,
          total: 200,
        },
        total: 200,
      });
    }
  }

  // 2. Chute Walls View: return 4-wall layout for My Site liner wear viewer
  try {
    const walls = await getAllChuteWallsFromDb(chute);
    const counts = await getLinerHealthCountsFromDb(chute);

    return NextResponse.json({
      success: true,
      source: "database",
      dialect: "postgres",
      database: process.env.DB_DATABASE || "DWMS_TestDB",
      chute,
      walls,
      counts,
    });
  } catch (err: any) {
    console.error(`[API /api/liners] Database query failed for chute ${chute}, using fallback:`, err?.message || err);
    const fallbackWalls = getChuteWallsForChute(chute);

    return NextResponse.json({
      success: true,
      source: "fallback_static",
      warning: `Database connection error: ${err?.message || "Unknown error"}. Displaying cached fallback data.`,
      debug_stack: err?.stack,
      chute,
      walls: fallbackWalls,
      counts: {
        healthy: 23,
        monitor: 11,
        action: 4,
        critical: 2,
        total: 40,
      },
    });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { fullCode, ...updates } = body;

    if (!fullCode) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: fullCode" },
        { status: 400 }
      );
    }

    // Auto-compute status if wear is provided
    if (typeof updates.wear === "number" && !updates.status) {
      if (updates.wear >= 90) updates.status = "imminent";
      else if (updates.wear >= 80) updates.status = "critical";
      else if (updates.wear >= 50) updates.status = "action";
      else if (updates.wear >= 26) updates.status = "monitor";
      else updates.status = "healthy";
    }

    const updatedLiner = await updateLinerInDb(fullCode, updates);

    if (!updatedLiner) {
      return NextResponse.json(
        { success: false, error: `Liner plate '${fullCode}' not found in database.` },
        { status: 404 }
      );
    }

    const counts = await getLinerHealthCountsFromDb(updatedLiner.chuteId || "CH-001");
    const distribution = await getPlantHealthDistributionFromDb();

    return NextResponse.json({
      success: true,
      message: `Liner ${fullCode} wear parameters updated in ${process.env.DB_DATABASE || "DWMS_TestDB"} successfully.`,
      database: process.env.DB_DATABASE || "DWMS_TestDB",
      updatedLiner,
      counts,
      distribution,
    });
  } catch (err: any) {
    console.error("[API /api/liners] Error updating liner:", err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Database error updating liner",
      },
      { status: 500 }
    );
  }
}

function allLinersToReportFormat(liners: any[]) {
  return liners.map((l) => {
    let status = "Healthy";
    if (l.status === "imminent" || l.wear >= 90) status = "Failure Imminent";
    else if (l.status === "critical" || l.wear >= 80) status = "Critical";
    else if (l.status === "action" || l.wear >= 50) status = "Action Required";
    else if (l.status === "monitor" || l.wear >= 26) status = "Monitor";

    return {
      position: l.id,
      liner: l.fullCode,
      chute: l.chuteId || "CH-001",
      junction: l.junctionId || "JH-01",
      zone: l.zone || "Impact",
      material: l.material || "Hardox 500",
      wear: l.wear,
      thickness: l.thickness,
      rul: l.rulDays,
      status,
    };
  });
}
