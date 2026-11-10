import { NextResponse } from "next/server";
import {
  getSiteDashboardFromDb,
  getApprovalQueueFromDb,
  getAlertInboxFromDb,
  getAllPlantLinersFromDb,
  getPlantHealthDistributionFromDb,
  getSequelize,
} from "@/lib/db";
import { QueryTypes } from "sequelize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const resource = searchParams.get("resource") || "dashboard";
  const siteCode = searchParams.get("site") || "SITE-RAJ";

  try {
    const sequelize = getSequelize();

    // 1. Site Dashboard KPI Summary
    if (resource === "dashboard") {
      const summary = await getSiteDashboardFromDb(siteCode);
      const distribution = await getPlantHealthDistributionFromDb();

      return NextResponse.json({
        success: true,
        source: "dwms_schema",
        database: process.env.DB_DATABASE || "DWMS_TestDB",
        summary,
        distribution,
      });
    }

    // 2. Approvals Queue (Maker-Checker pending work items)
    if (resource === "approvals" || resource === "work-items") {
      const items = await getApprovalQueueFromDb();
      return NextResponse.json({
        success: true,
        source: "dwms_schema",
        count: items.length,
        items,
      });
    }

    // 3. Alerts Inbox
    if (resource === "alerts") {
      const alerts = await getAlertInboxFromDb();
      return NextResponse.json({
        success: true,
        source: "dwms_schema",
        count: alerts.length,
        alerts,
      });
    }

    // 4. Hierarchy Path (Site -> JH -> Floor -> Chute -> Liner)
    if (resource === "hierarchy") {
      const hierarchy = await sequelize.query(
        `SELECT DISTINCT site_code, site_name, junction_house_code, junction_house_name,
                         floor_code, floor_name, chute_code, chute_name, count(liner_id) as liner_count
         FROM dwms.v_hierarchy_path
         GROUP BY site_code, site_name, junction_house_code, junction_house_name, floor_code, floor_name, chute_code, chute_name
         ORDER BY junction_house_code, floor_code, chute_code;`,
        { type: QueryTypes.SELECT }
      );
      return NextResponse.json({
        success: true,
        source: "dwms_schema",
        hierarchy,
      });
    }

    // 5. Prediction Accuracy (Inspections vs ML Model)
    if (resource === "predictions" || resource === "accuracy") {
      const accuracy = await sequelize.query(
        `SELECT * FROM dwms.v_prediction_accuracy LIMIT 50;`,
        { type: QueryTypes.SELECT }
      );
      return NextResponse.json({
        success: true,
        source: "dwms_schema",
        accuracy,
      });
    }

    // 6. Sensor Health View
    if (resource === "sensors") {
      const sensors = await sequelize.query(
        `SELECT * FROM dwms.v_sensor_health ORDER BY sensor_code;`,
        { type: QueryTypes.SELECT }
      );
      return NextResponse.json({
        success: true,
        source: "dwms_schema",
        sensors,
      });
    }

    // 7. Inventory Items
    if (resource === "inventory") {
      const inventory = await sequelize.query(
        `SELECT * FROM dwms.inventory_item WHERE status = 'ACTIVE' ORDER BY code;`,
        { type: QueryTypes.SELECT }
      );
      return NextResponse.json({
        success: true,
        source: "dwms_schema",
        inventory,
      });
    }

    return NextResponse.json(
      { success: false, error: `Unknown resource: '${resource}'` },
      { status: 400 }
    );
  } catch (err: any) {
    console.error(`[API /api/dwms?resource=${resource}] Error:`, err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Internal server error querying DWMS database",
      },
      { status: 500 }
    );
  }
}

