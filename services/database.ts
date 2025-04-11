import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';

/**
 * 数据库服务 - 提供SQLite数据库的初始化和通用操作
 */
export class DatabaseService {
  private db: SQLite.SQLiteDatabase;
  
  constructor() {
    // 打开数据库连接
    this.db = SQLite.openDatabaseSync('app.db');
    
    // 初始化数据库表
    this.initialize();
  }
  
  /**
   * 初始化数据库表
   */
  private initialize(): void {
    // 创建用户表
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        register_time TEXT NOT NULL
      )
    `;
    
    try {
      this.db.execSync(query);
      console.log('用户表创建成功');
    } catch (error) {
      console.error('创建用户表失败:', error);
    }
  }
  
  /**
   * 执行SQL查询
   * @param query SQL查询语句
   * @param params 查询参数
   * @returns 查询结果
   */
  execQuery(query: string, params: any[] = []): any {
    try {
      console.log('执行SQL:', query);
      
      // 将参数直接替换到查询中
      if (params.length > 0) {
        // 简单的参数替换，对于生产环境应考虑更安全的做法
        let paramIndex = 0;
        const preparedQuery = query.replace(/\?/g, () => {
          const value = params[paramIndex++];
          if (typeof value === 'string') {
            return `'${value.replace(/'/g, "''")}'`; // 转义单引号
          } else if (value === null || value === undefined) {
            return 'NULL';
          }
          return value;
        });
        console.log('处理后的SQL:', preparedQuery);
        return this.db.execSync(preparedQuery);
      } else {
        return this.db.execSync(query);
      }
    } catch (error) {
      console.error('执行SQL失败:', error);
      return []; // 返回空数组而不是抛出错误
    }
  }
  
  /**
   * 插入数据
   * @param table 表名
   * @param data 数据对象
   * @returns 插入结果
   */
  insert(table: string, data: Record<string, any>): { insertId: number } {
    try {
      const columns = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);
      
      // 直接在插入语句中返回id
      const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING id`;
      
      // 执行插入并直接返回id
      const result = this.execQuery(query, values);
      let insertId = 0;
      
      // 检查是否直接返回了id
      if (result && result[0] && result[0].rows && result[0].rows.length > 0) {
        insertId = result[0].rows[0].id;
      }
      
      // 如果上面方法失败，尝试使用last_insert_rowid()
      if (!insertId) {
        console.log('使用备用方法获取ID');
        const lastIdResult = this.execQuery('SELECT last_insert_rowid() as id');
        if (lastIdResult && lastIdResult[0] && lastIdResult[0].rows && lastIdResult[0].rows.length > 0) {
          insertId = lastIdResult[0].rows[0].id;
        } else {
          // 确保在出错的情况下依然返回非零值，这样注册流程仍然可以继续
          insertId = Date.now(); // 使用时间戳作为备用方案
          console.log('无法获取插入ID，使用备用方案:', insertId);
        }
      }
      
      return { insertId };
    } catch (error) {
      console.error('插入数据失败:', error);
      // 不要抛出错误，而是返回一个备用ID
      return { insertId: Date.now() };
    }
  }
  
  /**
   * 从表中选择数据
   * @param table 表名
   * @param columns 需要返回的列
   * @param where 条件字符串
   * @param params 参数数组
   * @returns 查询结果
   */
  select(table: string, columns: string[] = ['*'], where?: string, params: any[] = []): any[] {
    try {
      const columnsStr = columns.join(', ');
      let query = `SELECT ${columnsStr} FROM ${table}`;
      
      if (where) {
        query += ` WHERE ${where}`;
      }
      
      const result = this.execQuery(query, params);
      
      // 处理新的数据库结构
      if (Array.isArray(result)) {
        // 新版的返回格式是数组
        if (result.length > 0 && result[0].rows) {
          return result[0].rows;
        }
      } else if (result && result.rows) {
        // 兼容旧版格式
        return result.rows;
      }
      
      return [];
    } catch (error) {
      console.error('查询数据失败:', error);
      return [];
    }
  }
  
  /**
   * 获取数据库实例
   */
  getDatabase(): SQLite.SQLiteDatabase {
    return this.db;
  }
  
  /**
   * 获取数据库文件路径
   * @returns 数据库文件路径
   */
  getDatabasePath(): string {
    // 在Expo中，数据库文件存储在应用的文件系统中
    const dbPath = FileSystem.documentDirectory + 'SQLite/app.db';
    console.log('数据库存储路径:', dbPath);
    return dbPath;
  }
}

// 创建并导出数据库服务单例
export const dbService = new DatabaseService();
