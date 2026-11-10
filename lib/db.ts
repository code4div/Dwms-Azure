import { Sequelize, DataTypes, Model, Op, QueryTypes } from "sequelize";
import pg from "pg";
import {
  chuteWallsData,
  ChuteWall,
  LinerPlate,
  LinerStatus,
  PLANT_CHUTES,
  getChuteWallsForChute,
  getAllPlantLiners,
} from "./initialLinerData";

// Global cache for Sequelize instance across hot-reloads in Next.js development
declare global {
  var _sequelizeInstance: Sequelize | undefined;
  var _dbInitialized: boolean | undefined;
}

export function getSequelize(): Sequelize {
  if (global._sequelizeInstance) {
    return global._sequelizeInstance;
  }

  const databaseUrl = process.env.DATABASE_URL;
  let sequelize: Sequelize;

  if (databaseUrl) {
    console.info("[DWMS DB] Connecting to PostgreSQL via DATABASE_URL");
    sequelize = new Sequelize(databaseUrl, {
      dialect: "postgres",
      dialectModule: pg,
      logging: false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    });
  } else {
    const host = process.env.DB_HOST || process.env.DB_SERVER || "localhost";
    const port = parseInt(process.env.DB_PORT || "5432", 10);
    const database = process.env.DB_DATABASE || "DWMS_TestDB";
    const username = process.env.DB_USER || "postgres";
    const password = process.env.DB_PASSWORD || "Div@postgre1888";

    console.info(`[DWMS DB] Connecting to PostgreSQL at ${host}:${port}/${database}`);
    sequelize = new Sequelize(database, username, password, {
      host,
      port,
      dialect: "postgres",
      dialectModule: pg,
      logging: false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    });
  }

  if (process.env.NODE_ENV !== "production") {
    global._sequelizeInstance = sequelize;
  }

  return sequelize;
}

export interface LinerAttributes {
  fullCode: string;
  chuteId: string;
  junctionId: string;
  id: string;
  partNo: string;
  wallPartNumber: string;
  wallTitle: string;
  wallSubtitle: string;
  rowIndex: number;
  linerIndex: number;
  wear: number;
  thickness: number;
  origThickness: number;
  minAcceptable: number;
  wearRateDay: number;
  wearRateMonth: number;
  rulDays: number;
  lastInspection: string;
  lastReplaced: string;
  status: LinerStatus;
  material: string;
  zone: string;
  sensorId: string;
  assembly: string;
  drawingRef: string;
  instanceId: string;
  weight: string;
  dimensions: string;
  fixing: string;
}

export class LinerModel extends Model<LinerAttributes, Partial<LinerAttributes>> implements LinerAttributes {
  declare fullCode: string;
  declare chuteId: string;
  declare junctionId: string;
  declare id: string;
  declare partNo: string;
  declare wallPartNumber: string;
  declare wallTitle: string;
  declare wallSubtitle: string;
  declare rowIndex: number;
  declare linerIndex: number;
  declare wear: number;
  declare thickness: number;
  declare origThickness: number;
  declare minAcceptable: number;
  declare wearRateDay: number;
  declare wearRateMonth: number;
  declare rulDays: number;
  declare lastInspection: string;
  declare lastReplaced: string;
  declare status: LinerStatus;
  declare material: string;
  declare zone: string;
  declare sensorId: string;
  declare assembly: string;
  declare drawingRef: string;
  declare instanceId: string;
  declare weight: string;
  declare dimensions: string;
  declare fixing: string;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export function getLinerModel(): typeof LinerModel {
  const sequelize = getSequelize();

  if (sequelize.models.Liner) {
    return sequelize.models.Liner as typeof LinerModel;
  }

  LinerModel.init(
    {
      fullCode: {
        type: DataTypes.STRING(100),
        primaryKey: true,
        allowNull: false,
      },
      chuteId: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "CH-001",
      },
      junctionId: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "JH-01",
      },
      id: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      partNo: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      wallPartNumber: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      wallTitle: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      wallSubtitle: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      rowIndex: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      linerIndex: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      wear: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      thickness: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      origThickness: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      minAcceptable: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      wearRateDay: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      wearRateMonth: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      rulDays: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      lastInspection: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      lastReplaced: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      material: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      zone: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      sensorId: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      assembly: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      drawingRef: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      instanceId: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      weight: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      dimensions: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      fixing: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "Liners",
      timestamps: true,
    }
  );

  return LinerModel;
}

/**
 * Initializes database tables and seeds all 200 plant liners (5 chutes × 40 liners) if table has fewer records.
 */
export async function initDb(forceSync: boolean = false): Promise<void> {
  const sequelize = getSequelize();
  const Model = getLinerModel();

  if (!global._dbInitialized || forceSync) {
    await sequelize.authenticate();
    await Model.sync({ alter: true });

    const count = await Model.count();
    if (count < 200 || forceSync) {
      console.info(`[DWMS DB] Seeding database with all 200 plant liners across 5 chutes (CH-001 - CH-005)...`);

      const seedRecords: LinerAttributes[] = [];

      PLANT_CHUTES.forEach((chute) => {
        const walls = getChuteWallsForChute(chute.id);
        walls.forEach((wall) => {
          wall.rows.forEach((row, rowIndex) => {
            row.liners.forEach((liner, linerIndex) => {
              seedRecords.push({
                fullCode: liner.fullCode,
                chuteId: chute.id,
                junctionId: chute.junction,
                id: liner.id,
                partNo: liner.partNo,
                wallPartNumber: wall.partNumber,
                wallTitle: wall.title,
                wallSubtitle: wall.subtitle,
                rowIndex,
                linerIndex,
                wear: liner.wear,
                thickness: liner.thickness,
                origThickness: liner.origThickness,
                minAcceptable: liner.minAcceptable,
                wearRateDay: liner.wearRateDay,
                wearRateMonth: liner.wearRateMonth,
                rulDays: liner.rulDays,
                lastInspection: liner.lastInspection,
                lastReplaced: liner.lastReplaced,
                status: liner.status,
                material: liner.material,
                zone: liner.zone,
                sensorId: liner.sensorId,
                assembly: liner.assembly,
                drawingRef: liner.drawingRef,
                instanceId: liner.instanceId,
                weight: liner.weight,
                dimensions: liner.dimensions,
                fixing: liner.fixing,
              });
            });
          });
        });
      });

      // Upsert all seed records in transaction or batches
      for (const record of seedRecords) {
        await Model.upsert(record);
      }

      console.info(`[DWMS DB] Successfully seeded ${seedRecords.length} liners into PostgreSQL database.`);
    }

    global._dbInitialized = true;
  }
}

/**
 * Retrieves all liners from the database for a specific chute and structures them into the exact ChuteWall[] layout.
 * Queries dwms.v_liner_live directly with fallback to LinerModel / static templates.
 */
export async function getAllChuteWallsFromDb(targetChuteId: string = "CH-001"): Promise<ChuteWall[]> {
  try {
    const sequelize = getSequelize();
    const rows = await sequelize.query<any>(
      `SELECT * FROM dwms.v_liner_live WHERE chute_code = :chuteCode ORDER BY position_code ASC;`,
      {
        replacements: { chuteCode: targetChuteId },
        type: QueryTypes.SELECT,
      }
    );

    if (rows && rows.length > 0) {
      // Base chute wall template to retain wall structure & dimensions
      const defaultWalls = getChuteWallsForChute(targetChuteId);
      const rowByPos = new Map<string, any>();
      rows.forEach((r) => rowByPos.set(r.position_code, r));

      return defaultWalls.map((wall) => ({
        ...wall,
        rows: wall.rows.map((row) => ({
          liners: row.liners.map((l) => {
            const dbRow = rowByPos.get(l.id);
            if (!dbRow) return l;

            const wear = parseFloat(dbRow.wear_percentage) || l.wear;
            const thick = parseFloat(dbRow.current_thickness_mm) || l.thickness;
            const rul = parseInt(dbRow.remaining_life_days, 10) || l.rulDays;

            let status: LinerStatus = "healthy";
            if (wear >= 90 || dbRow.condition === "CRITICAL" || dbRow.condition === "FAILED") {
              status = "imminent";
            } else if (wear >= 80) {
              status = "critical";
            } else if (wear >= 50 || dbRow.condition === "WARNING") {
              status = "action";
            } else if (wear >= 26 || dbRow.condition === "MODERATE") {
              status = "monitor";
            }

            return {
              ...l,
              wear,
              thickness: thick,
              rulDays: rul,
              status,
              material: dbRow.material_type || dbRow.part_name || l.material,
              zone: dbRow.zone || l.zone,
              sensorId: dbRow.sensor_code || l.sensorId,
              chuteId: targetChuteId,
              junctionId: dbRow.junction_house_code || l.junctionId,
            };
          }),
        })),
      }));
    }
  } catch (err) {
    console.warn("[DWMS DB] v_liner_live query fallback to LinerModel:", err);
  }

  // Fallback to LinerModel in public schema
  await initDb();
  const Model = getLinerModel();

  const records = await Model.findAll({
    where: { chuteId: targetChuteId },
    order: [
      ["wallPartNumber", "ASC"],
      ["rowIndex", "ASC"],
      ["linerIndex", "ASC"],
    ],
  });

  if (!records || records.length === 0) {
    return getChuteWallsForChute(targetChuteId);
  }

  const defaultWalls = getChuteWallsForChute(targetChuteId);
  const wallMap = new Map<string, { partNumber: string; title: string; subtitle: string; rowMap: Map<number, LinerPlate[]> }>();

  defaultWalls.forEach((w) => {
    wallMap.set(w.partNumber, {
      partNumber: w.partNumber,
      title: w.title,
      subtitle: w.subtitle,
      rowMap: new Map(),
    });
  });

  records.forEach((rec) => {
    const data = rec.toJSON() as LinerAttributes;
    let wall = wallMap.get(data.wallPartNumber);
    if (!wall) {
      wall = {
        partNumber: data.wallPartNumber,
        title: data.wallTitle,
        subtitle: data.wallSubtitle,
        rowMap: new Map(),
      };
      wallMap.set(data.wallPartNumber, wall);
    }

    if (!wall.rowMap.has(data.rowIndex)) {
      wall.rowMap.set(data.rowIndex, []);
    }

    const linerPlate: LinerPlate = {
      id: data.id,
      fullCode: data.fullCode,
      partNo: data.partNo,
      wear: data.wear,
      thickness: data.thickness,
      origThickness: data.origThickness,
      minAcceptable: data.minAcceptable,
      wearRateDay: data.wearRateDay,
      wearRateMonth: data.wearRateMonth,
      rulDays: data.rulDays,
      lastInspection: data.lastInspection,
      lastReplaced: data.lastReplaced,
      status: data.status,
      material: data.material,
      zone: data.zone,
      sensorId: data.sensorId,
      assembly: data.assembly,
      drawingRef: data.drawingRef,
      instanceId: data.instanceId,
      weight: data.weight,
      dimensions: data.dimensions,
      fixing: data.fixing,
      chuteId: data.chuteId,
      junctionId: data.junctionId,
    };

    wall.rowMap.get(data.rowIndex)!.push(linerPlate);
  });

  const result: ChuteWall[] = [];
  wallMap.forEach((wall) => {
    const sortedRowIndices = Array.from(wall.rowMap.keys()).sort((a, b) => a - b);
    const rows = sortedRowIndices.map((idx) => ({
      liners: wall.rowMap.get(idx) || [],
    }));
    result.push({
      partNumber: wall.partNumber,
      title: wall.title,
      subtitle: wall.subtitle,
      rows,
    });
  });

  return result;
}

/**
 * Retrieves flat list of all plant liners from dwms.v_liner_live (with fallback to LinerModel).
 */
export async function getAllPlantLinersFromDb(filter?: {
  junctionId?: string;
  chuteId?: string;
  zone?: string;
}) {
  try {
    const sequelize = getSequelize();
    let sql = `SELECT * FROM dwms.v_liner_live WHERE 1=1`;
    const replacements: any = {};

    if (filter?.junctionId && filter.junctionId !== "All") {
      sql += ` AND junction_house_code = :junctionId`;
      replacements.junctionId = filter.junctionId;
    }
    if (filter?.chuteId && filter.chuteId !== "All") {
      sql += ` AND chute_code = :chuteId`;
      replacements.chuteId = filter.chuteId;
    }
    if (filter?.zone && filter.zone !== "all" && filter.zone !== "All") {
      sql += ` AND LOWER(zone) LIKE LOWER(:zone)`;
      replacements.zone = `%${filter.zone}%`;
    }

    sql += ` ORDER BY wear_percentage DESC;`;

    const rows = await sequelize.query<any>(sql, {
      replacements,
      type: QueryTypes.SELECT,
    });

    if (rows && rows.length > 0) {
      return rows.map((r) => {
        const wear = parseFloat(r.wear_percentage) || 0;
        const thick = parseFloat(r.current_thickness_mm) || 0;
        const rul = parseInt(r.remaining_life_days, 10) || 0;

        let status: "Failure Imminent" | "Critical" | "Action Required" | "Monitor" | "Healthy" = "Healthy";
        if (wear >= 90) status = "Failure Imminent";
        else if (wear >= 80) status = "Critical";
        else if (wear >= 50) status = "Action Required";
        else if (wear >= 26) status = "Monitor";

        return {
          position: r.position_code,
          liner: r.liner_code,
          chute: r.chute_code,
          junction: r.junction_house_code,
          zone: r.zone,
          material: r.material_type || r.part_name || "AR400 Wear Steel",
          wear,
          thickness: thick,
          rul,
          status,
          rawStatus: r.condition?.toLowerCase() || "healthy",
          sensorCode: r.sensor_code,
          sensorHealth: r.sensor_health_status,
        };
      });
    }
  } catch (err) {
    console.warn("[DWMS DB] getAllPlantLinersFromDb v_liner_live error, fallback to LinerModel:", err);
  }

  // Fallback to LinerModel
  await initDb();
  const Model = getLinerModel();

  const whereClause: any = {};
  if (filter?.junctionId && filter.junctionId !== "All") {
    whereClause.junctionId = filter.junctionId;
  }
  if (filter?.chuteId && filter.chuteId !== "All") {
    whereClause.chuteId = filter.chuteId;
  }
  if (filter?.zone && filter.zone !== "all" && filter.zone !== "All") {
    whereClause.zone = { [Op.iLike]: `%${filter.zone}%` };
  }

  const records = await Model.findAll({
    where: whereClause,
    order: [["wear", "DESC"]],
  });

  return records.map((rec) => {
    const data = rec.toJSON() as LinerAttributes;
    let mappedStatus: "Failure Imminent" | "Critical" | "Action Required" | "Monitor" | "Healthy" = "Healthy";
    if (data.status === "imminent" || data.wear >= 90) mappedStatus = "Failure Imminent";
    else if (data.status === "critical" || data.wear >= 80) mappedStatus = "Critical";
    else if (data.status === "action" || data.wear >= 50) mappedStatus = "Action Required";
    else if (data.status === "monitor" || data.wear >= 26) mappedStatus = "Monitor";

    return {
      position: data.id,
      liner: data.fullCode,
      chute: data.chuteId,
      junction: data.junctionId,
      zone: data.zone,
      material: data.material,
      wear: data.wear,
      thickness: data.thickness,
      rul: data.rulDays,
      status: mappedStatus,
      rawStatus: data.status,
    };
  });
}

/**
 * Computes health distribution counts across the entire 200 plant fleet from PostgreSQL.
 */
export async function getPlantHealthDistributionFromDb() {
  try {
    const sequelize = getSequelize();
    const rows = await sequelize.query<any>(
      `SELECT wear_percentage, condition FROM dwms.v_liner_live;`,
      { type: QueryTypes.SELECT }
    );

    if (rows && rows.length > 0) {
      let healthy = 0;
      let monitor = 0;
      let action = 0;
      let critical = 0;
      let imminent = 0;
      let offline = 1; // 1 Offline / Stale sensor baseline

      rows.forEach((r) => {
        const wear = parseFloat(r.wear_percentage) || 0;
        const cond = r.condition;

        if (wear >= 90 || cond === "FAILED") imminent++;
        else if (wear >= 80 || cond === "CRITICAL") critical++;
        else if (wear >= 50 || cond === "WARNING") action++;
        else if (wear >= 26 || cond === "MODERATE") monitor++;
        else healthy++;
      });

      return {
        healthy,
        monitor,
        action,
        critical,
        imminent,
        offline,
        total: rows.length,
      };
    }
  } catch (err) {
    console.warn("[DWMS DB] getPlantHealthDistributionFromDb v_liner_live error, fallback:", err);
  }

  await initDb();
  const Model = getLinerModel();
  const liners = await Model.findAll({ attributes: ["status", "wear"] });

  let healthy = 0;
  let monitor = 0;
  let action = 0;
  let critical = 0;
  let imminent = 0;
  let offline = 1;

  liners.forEach((l) => {
    const status = l.status;
    const wear = l.wear;

    if (status === "offline") offline++;
    else if (status === "imminent" || wear >= 90) imminent++;
    else if (status === "critical" || wear >= 80) critical++;
    else if (status === "action" || wear >= 50) action++;
    else if (status === "monitor" || wear >= 26) monitor++;
    else healthy++;
  });

  return {
    healthy,
    monitor,
    action,
    critical,
    imminent,
    offline,
    total: liners.length,
  };
}

/**
 * Updates a specific liner's wear properties in dwms.liner_state and legacy Liners table.
 */
export async function updateLinerInDb(
  fullCode: string,
  updates: Partial<LinerAttributes>
): Promise < any > {
    const sequelize = getSequelize();

      // 1. Update in dwms.liner_state
      try {
        let condition = "HEALTHY";
        const wear = updates.wear ?? 50;
        if (wear >= 90) condition = "CRITICAL";
        else if (wear >= 70) condition = "WARNING";
        else if (wear >= 30) condition = "MODERATE";

        await sequelize.query(
          `
      UPDATE dwms.liner_state ls
      SET current_thickness_mm = COALESCE(:thickness, ls.current_thickness_mm),
          wear_percentage = COALESCE(:wear, ls.wear_percentage),
          remaining_life_days = COALESCE(:rul, ls.remaining_life_days),
          condition = :condition,
          last_updated_at = clock_timestamp()
      FROM dwms.liner l
      WHERE ls.liner_id = l.id AND l.code = :fullCode;
      `,
          {
            replacements: {
              thickness: updates.thickness,
              wear: updates.wear,
              rul: updates.rulDays,
              condition,
              fullCode,
            },
          }
        );
      } catch (err) {
        console.warn("[DWMS DB] Failed to update dwms.liner_state:", err);
      }

      // 2. Update legacy Model
      try {
        await initDb();
        const Model = getLinerModel();
        const liner = await Model.findByPk(fullCode);
        if (liner) {
          await liner.update(updates);
          return liner.toJSON() as LinerAttributes;
        }
      } catch (err) {
        console.warn("[DWMS DB] Legacy Model update warning:", err);
      }

      return { fullCode, ...updates };
    }

/**
 * Computes health counts for a specific chute.
 */
export async function getLinerHealthCountsFromDb(chuteId: string = "CH-001") {
    try {
      const sequelize = getSequelize();
      const rows = await sequelize.query<any>(
        `SELECT wear_percentage, condition FROM dwms.v_liner_live WHERE chute_code = :chuteCode;`,
        {
          replacements: { chuteCode: chuteId },
          type: QueryTypes.SELECT,
        }
      );

      if (rows && rows.length > 0) {
        let healthy = 0;
        let monitor = 0;
        let action = 0;
        let critical = 0;

        rows.forEach((r) => {
          const wear = parseFloat(r.wear_percentage) || 0;
          const cond = r.condition;
          if (wear >= 80 || cond === "CRITICAL" || cond === "FAILED") critical++;
          else if (wear >= 50 || cond === "WARNING") action++;
          else if (wear >= 26 || cond === "MODERATE") monitor++;
          else healthy++;
        });

        return {
          healthy,
          monitor,
          action,
          critical,
          total: rows.length,
        };
      }
    } catch (err) {
      console.warn("[DWMS DB] getLinerHealthCountsFromDb error:", err);
    }

    await initDb();
    const Model = getLinerModel();
    const liners = await Model.findAll({
      where: { chuteId },
      attributes: ["status", "wear"],
    });

    let healthy = 0;
    let monitor = 0;
    let action = 0;
    let critical = 0;

    liners.forEach((l) => {
      const status = l.status;
      const wear = l.wear;
      if (status === "critical" || status === "imminent" || wear >= 80) critical++;
      else if (status === "action" || wear >= 50) action++;
      else if (status === "monitor" || wear >= 26) monitor++;
      else healthy++;
    });

    return {
      healthy,
      monitor,
      action,
      critical,
      total: liners.length,
    };
  }

  /**
   * Retrieves high-level Site Dashboard KPIs from dwms.v_site_dashboard.
   */
  export async function getSiteDashboardFromDb(siteCode: string = "SITE-RAJ") {
    const sequelize = getSequelize();
    const rows = await sequelize.query<any>(
      `SELECT * FROM dwms.v_site_dashboard WHERE site_code = :siteCode;`,
      {
        replacements: { siteCode },
        type: QueryTypes.SELECT,
      }
    );
    return rows[0] || null;
  }

  /**
   * Retrieves pending approval work items from dwms.v_approval_queue.
   */
  export async function getApprovalQueueFromDb() {
    const sequelize = getSequelize();
    return await sequelize.query<any>(
      `SELECT * FROM dwms.v_approval_queue ORDER BY created_at DESC;`,
      { type: QueryTypes.SELECT }
    );
  }

  /**
   * Retrieves open alerts from dwms.v_alert_inbox.
   */
  export async function getAlertInboxFromDb() {
    const sequelize = getSequelize();
    return await sequelize.query<any>(
      `SELECT * FROM dwms.v_alert_inbox ORDER BY triggered_at DESC;`,
      { type: QueryTypes.SELECT }
    );
  }

