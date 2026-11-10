import fs from 'fs';
import path from 'path';
import { Sequelize, DataTypes } from 'sequelize';
import pg from 'pg';

// Read .env.local if available
const envPath = path.resolve(process.cwd(), '.env.local');
let databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl && fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('DATABASE_URL=')) {
      let val = trimmed.slice(13).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      databaseUrl = val;
    }
  });
}

console.log('--- DWMS: Connecting to PostgreSQL Database ---');
const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, {
      dialect: 'postgres',
      dialectModule: pg,
      logging: false,
    })
  : new Sequelize(
      process.env.DB_DATABASE || 'DWMS_TestDB',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || 'Div@postgre1888',
      {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        dialect: 'postgres',
        dialectModule: pg,
        logging: false,
      }
    );

const Liner = sequelize.define('Liner', {
  fullCode: { type: DataTypes.STRING(100), primaryKey: true },
  chuteId: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'CH-001' },
  junctionId: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'JH-01' },
  id: { type: DataTypes.STRING(20), allowNull: false },
  partNo: { type: DataTypes.STRING(50), allowNull: false },
  wallPartNumber: { type: DataTypes.STRING(50), allowNull: false },
  wallTitle: { type: DataTypes.STRING(100), allowNull: false },
  wallSubtitle: { type: DataTypes.STRING(150), allowNull: false },
  rowIndex: { type: DataTypes.INTEGER, allowNull: false },
  linerIndex: { type: DataTypes.INTEGER, allowNull: false },
  wear: { type: DataTypes.FLOAT, allowNull: false },
  thickness: { type: DataTypes.FLOAT, allowNull: false },
  origThickness: { type: DataTypes.FLOAT, allowNull: false },
  minAcceptable: { type: DataTypes.FLOAT, allowNull: false },
  wearRateDay: { type: DataTypes.FLOAT, allowNull: false },
  wearRateMonth: { type: DataTypes.FLOAT, allowNull: false },
  rulDays: { type: DataTypes.INTEGER, allowNull: false },
  lastInspection: { type: DataTypes.STRING(50) },
  lastReplaced: { type: DataTypes.STRING(50) },
  status: { type: DataTypes.STRING(20), allowNull: false },
  material: { type: DataTypes.STRING(150) },
  zone: { type: DataTypes.STRING(100) },
  sensorId: { type: DataTypes.STRING(50) },
  assembly: { type: DataTypes.STRING(50) },
  drawingRef: { type: DataTypes.STRING(100) },
  instanceId: { type: DataTypes.STRING(50) },
  weight: { type: DataTypes.STRING(50) },
  dimensions: { type: DataTypes.STRING(100) },
  fixing: { type: DataTypes.STRING(100) }
}, {
  tableName: 'Liners',
  timestamps: true
});

async function main() {
  await sequelize.authenticate();
  console.log('✓ Successfully connected to PostgreSQL database!');
  await Liner.sync({ alter: true });

  const fileStr = fs.readFileSync('lib/initialLinerData.ts', 'utf8');
  const jsonMatch = fileStr.slice(fileStr.indexOf('export const chuteWallsData: ChuteWall[] = ') + 43, fileStr.indexOf('export const PLANT_CHUTES ='));
  const chuteWalls = eval(jsonMatch.trim().replace(/;$/, ''));

  const plantChutes = [
    { id: "CH-001", junction: "JH-01", name: "Primary Feeder Chute" },
    { id: "CH-002", junction: "JH-01", name: "Coarse Ore Return Chute" },
    { id: "CH-003", junction: "JH-02", name: "Conveyor CV-102 Transfer" },
    { id: "CH-004", junction: "JH-02", name: "Surge Bin Diverter Chute" },
    { id: "CH-005", junction: "JH-05", name: "Screen House Oversize Re-crush" },
  ];

  const records = [];

  plantChutes.forEach((chute) => {
    chuteWalls.forEach((wall) => {
      wall.rows.forEach((row, rowIndex) => {
        row.liners.forEach((liner, linerIndex) => {
          let wear = liner.wear;
          let status = liner.status;
          let material = liner.material;
          let zone = liner.zone;

          if (chute.id === "CH-001") {
            if (liner.id === "2B" && rowIndex === 0) {
              wear = 93.4;
              status = "imminent";
              material = "Chromium Carbide Overlay 8+8";
              zone = "Back Plate";
            } else if (liner.id === "1B") {
              wear = 81.2;
              status = "critical";
              material = "Ceramic Composite 92% Al2O3";
              zone = "Impact";
            }
          } else if (chute.id === "CH-002") {
            if (liner.id === "4B") {
              wear = 88.1;
              status = "critical";
              material = "Bi-metallic White Iron Tile";
              zone = "Discharge";
            } else if (liner.id === "4G") {
              wear = 0.0;
              status = "offline";
            } else {
              wear = Math.min(76, Math.max(12, Number((liner.wear * 0.92).toFixed(1))));
              status = wear >= 50 ? "action" : wear >= 26 ? "monitor" : "healthy";
            }
          } else if (chute.id === "CH-003") {
            if (liner.id === "2J" || (liner.id === "2B" && rowIndex === 1)) {
              wear = 91.6;
              status = "imminent";
              material = "Ceramic Composite 92% Al2O3";
              zone = "Rear Wall";
            } else if (liner.id === "1A") {
              wear = 80.5;
              status = "critical";
              material = "Ceramic Composite 92% Al2O3";
              zone = "Impact";
            } else {
              wear = Math.min(79, Math.max(11, Number((liner.wear * 1.05).toFixed(1))));
              status = wear >= 50 ? "action" : wear >= 26 ? "monitor" : "healthy";
            }
          } else if (chute.id === "CH-004") {
            if (liner.id === "3A") {
              wear = 71.8;
              status = "action";
              material = "AR400 Wear Steel";
              zone = "Side Wall";
            } else {
              wear = Math.min(68, Math.max(9, Number((liner.wear * 0.82).toFixed(1))));
              status = wear >= 50 ? "action" : wear >= 26 ? "monitor" : "healthy";
            }
          } else if (chute.id === "CH-005") {
            if (liner.id === "3F") {
              wear = 80.1;
              status = "critical";
              material = "Polyurethane Composite Plate";
              zone = "Side Wall";
            } else {
              wear = Math.min(77, Math.max(10, Number((liner.wear * 0.96).toFixed(1))));
              status = wear >= 50 ? "action" : wear >= 26 ? "monitor" : "healthy";
            }
          }

          const origThickness = liner.origThickness || 30;
          const thickness = Number((origThickness * ((100 - wear) / 100)).toFixed(1));
          const rulDays = Math.max(15, Math.round(liner.rulDays * ((100 - wear) / (100 - (liner.wear || 50)))));

          const fullCode = liner.fullCode ? liner.fullCode.replace('CH-001', chute.id) : `${chute.id}·${liner.id}`;

          records.push({
            fullCode,
            chuteId: chute.id,
            junctionId: chute.junction,
            id: liner.id,
            partNo: liner.partNo,
            wallPartNumber: wall.partNumber,
            wallTitle: wall.title,
            wallSubtitle: wall.subtitle,
            rowIndex,
            linerIndex,
            wear,
            thickness,
            origThickness,
            minAcceptable: liner.minAcceptable,
            wearRateDay: liner.wearRateDay,
            wearRateMonth: liner.wearRateMonth,
            rulDays,
            lastInspection: liner.lastInspection,
            lastReplaced: liner.lastReplaced,
            status,
            material,
            zone,
            sensorId: `${chute.id}-${liner.id}`,
            assembly: wall.partNumber,
            drawingRef: liner.drawingRef,
            instanceId: `${liner.id}-1`,
            weight: liner.weight,
            dimensions: liner.dimensions,
            fixing: liner.fixing
          });
        });
      });
    });
  });

  console.log(`--- Seeding ${records.length} plant liners into PostgreSQL table 'Liners'... ---`);
  await Liner.destroy({ where: {}, truncate: true });
  for (const r of records) {
    await Liner.upsert(r);
  }

  const count = await Liner.count();
  console.log(`✓ PostgreSQL Synchronization complete! Total liners in database: ${count}`);
  process.exit(0);
}

main().catch(err => {
  console.error('Database sync error:', err);
  process.exit(1);
});
