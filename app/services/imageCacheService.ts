'use client';

import { ImageFile } from '../types';

/**
 * 图片缓存服务
 * 
 * 使用IndexedDB存储图片数据和元数据，提供更大的存储容量和更好的性能
 */
class ImageCacheService {
  private dbName = 'ImageGalleryStorage';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  
  // 初始化数据库
  async init(): Promise<void> {
    if (this.db) return;
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onupgradeneeded = () => {
        const db = request.result;
        // 创建图片存储对象
        if (!db.objectStoreNames.contains('images')) {
          db.createObjectStore('images', { keyPath: 'id' });
        }
        // 创建重命名图片存储对象
        if (!db.objectStoreNames.contains('renamedImages')) {
          db.createObjectStore('renamedImages', { keyPath: 'id' });
        }
        // 创建元数据存储对象
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB初始化成功');
        resolve();
      };
      
      request.onerror = () => {
        console.error('IndexedDB初始化失败:', request.error);
        reject(request.error);
      };
    });
  }
  
  // 保存图片
  async saveImages(images: ImageFile[]): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('数据库未初始化');
    
    console.log(`准备保存${images.length}张图片到IndexedDB`);
    
    return new Promise((resolve, reject) => {
      try {
        const tx = this.db!.transaction('images', 'readwrite');
        const store = tx.objectStore('images');
        
        // 清空旧数据
        store.clear();
        
        // 存储新数据
        images.forEach(image => {
          store.put(image);
        });
        
        tx.oncomplete = () => {
          console.log(`成功保存${images.length}张图片到IndexedDB`);
          resolve();
        };
        
        tx.onerror = (error) => {
          console.error('保存图片到IndexedDB失败:', error);
          reject(error);
        };
      } catch (error) {
        console.error('保存图片到IndexedDB时出错:', error);
        reject(error);
      }
    });
  }
  
  // 加载图片
  async loadImages(): Promise<ImageFile[]> {
    await this.init();
    if (!this.db) throw new Error('数据库未初始化');
    
    return new Promise((resolve, reject) => {
      try {
        const tx = this.db!.transaction('images', 'readonly');
        const store = tx.objectStore('images');
        
        const request = store.getAll();
        
        request.onsuccess = () => {
          console.log(`从IndexedDB加载了${request.result?.length || 0}张图片`);
          resolve(request.result || []);
        };
        
        request.onerror = (error) => {
          console.error('从IndexedDB加载图片失败:', error);
          reject(error);
        };
      } catch (error) {
        console.error('从IndexedDB加载图片时出错:', error);
        reject(error);
      }
    });
  }
  
  // 保存重命名的图片
  async saveRenamedImages(images: ImageFile[]): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('数据库未初始化');
    
    console.log(`准备保存${images.length}张重命名图片到IndexedDB`);
    
    return new Promise((resolve, reject) => {
      try {
        const tx = this.db!.transaction('renamedImages', 'readwrite');
        const store = tx.objectStore('renamedImages');
        
        // 清空旧数据
        store.clear();
        
        // 存储新数据
        images.forEach(image => {
          store.put(image);
        });
        
        tx.oncomplete = () => {
          console.log(`成功保存${images.length}张重命名图片到IndexedDB`);
          resolve();
        };
        
        tx.onerror = (error) => {
          console.error('保存重命名图片到IndexedDB失败:', error);
          reject(error);
        };
      } catch (error) {
        console.error('保存重命名图片到IndexedDB时出错:', error);
        reject(error);
      }
    });
  }
  
  // 加载重命名的图片
  async loadRenamedImages(): Promise<ImageFile[]> {
    await this.init();
    if (!this.db) throw new Error('数据库未初始化');
    
    return new Promise((resolve, reject) => {
      try {
        const tx = this.db!.transaction('renamedImages', 'readonly');
        const store = tx.objectStore('renamedImages');
        
        const request = store.getAll();
        
        request.onsuccess = () => {
          console.log(`从IndexedDB加载了${request.result?.length || 0}张重命名图片`);
          resolve(request.result || []);
        };
        
        request.onerror = (error) => {
          console.error('从IndexedDB加载重命名图片失败:', error);
          reject(error);
        };
      } catch (error) {
        console.error('从IndexedDB加载重命名图片时出错:', error);
        reject(error);
      }
    });
  }
  
  // 清空图片
  async clearImages(): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('数据库未初始化');
    
    return new Promise((resolve, reject) => {
      try {
        const tx = this.db!.transaction('images', 'readwrite');
        const store = tx.objectStore('images');
        
        const request = store.clear();
        
        request.onsuccess = () => {
          console.log('成功清空IndexedDB中的图片');
          resolve();
        };
        
        request.onerror = (error) => {
          console.error('清空IndexedDB中的图片失败:', error);
          reject(error);
        };
      } catch (error) {
        console.error('清空IndexedDB中的图片时出错:', error);
        reject(error);
      }
    });
  }
  
  // 清空重命名的图片
  async clearRenamedImages(): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('数据库未初始化');
    
    return new Promise((resolve, reject) => {
      try {
        const tx = this.db!.transaction('renamedImages', 'readwrite');
        const store = tx.objectStore('renamedImages');
        
        const request = store.clear();
        
        request.onsuccess = () => {
          console.log('成功清空IndexedDB中的重命名图片');
          resolve();
        };
        
        request.onerror = (error) => {
          console.error('清空IndexedDB中的重命名图片失败:', error);
          reject(error);
        };
      } catch (error) {
        console.error('清空IndexedDB中的重命名图片时出错:', error);
        reject(error);
      }
    });
  }
  
  // 保存元数据
  async saveMetadata(key: string, data: any): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('数据库未初始化');
    
    return new Promise((resolve, reject) => {
      try {
        const tx = this.db!.transaction('metadata', 'readwrite');
        const store = tx.objectStore('metadata');
        
        store.put({ key, data });
        
        tx.oncomplete = () => {
          console.log(`成功保存元数据: ${key}`);
          resolve();
        };
        
        tx.onerror = (error) => {
          console.error(`保存元数据失败: ${key}`, error);
          reject(error);
        };
      } catch (error) {
        console.error(`保存元数据时出错: ${key}`, error);
        reject(error);
      }
    });
  }
  
  // 加载元数据
  async loadMetadata<T>(key: string): Promise<T | null> {
    await this.init();
    if (!this.db) throw new Error('数据库未初始化');
    
    return new Promise((resolve, reject) => {
      try {
        const tx = this.db!.transaction('metadata', 'readonly');
        const store = tx.objectStore('metadata');
        
        const request = store.get(key);
        
        request.onsuccess = () => {
          if (request.result) {
            console.log(`成功加载元数据: ${key}`);
            resolve(request.result.data);
          } else {
            console.log(`未找到元数据: ${key}`);
            resolve(null);
          }
        };
        
        request.onerror = (error) => {
          console.error(`加载元数据失败: ${key}`, error);
          reject(error);
        };
      } catch (error) {
        console.error(`加载元数据时出错: ${key}`, error);
        reject(error);
      }
    });
  }
  
  // 删除元数据
  async deleteMetadata(key: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('数据库未初始化');
    
    return new Promise((resolve, reject) => {
      try {
        const tx = this.db!.transaction('metadata', 'readwrite');
        const store = tx.objectStore('metadata');
        
        store.delete(key);
        
        tx.oncomplete = () => {
          console.log(`成功删除元数据: ${key}`);
          resolve();
        };
        
        tx.onerror = (error) => {
          console.error(`删除元数据失败: ${key}`, error);
          reject(error);
        };
      } catch (error) {
        console.error(`删除元数据时出错: ${key}`, error);
        reject(error);
      }
    });
  }
  
  // 计算数据库大小
  async getStorageSize(): Promise<{ total: number, images: number, renamedImages: number, metadata: number }> {
    await this.init();
    if (!this.db) throw new Error('数据库未初始化');
    
    const sizes = {
      total: 0,
      images: 0,
      renamedImages: 0,
      metadata: 0
    };
    
    const calculateStoreSize = async (storeName: string): Promise<number> => {
      return new Promise((resolve) => {
        const tx = this.db!.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const request = store.getAll();
        
        request.onsuccess = () => {
          const data = request.result;
          let size = 0;
          
          if (data && data.length > 0) {
            // 估算JSON字符串大小
            const jsonStr = JSON.stringify(data);
            size = jsonStr.length;
          }
          
          resolve(size);
        };
        
        request.onerror = () => {
          resolve(0);
        };
      });
    };
    
    sizes.images = await calculateStoreSize('images');
    sizes.renamedImages = await calculateStoreSize('renamedImages');
    sizes.metadata = await calculateStoreSize('metadata');
    sizes.total = sizes.images + sizes.renamedImages + sizes.metadata;
    
    console.log('IndexedDB存储大小(字节):', sizes);
    return sizes;
  }
  
  // 降级回localStorage（当IndexedDB不可用时）
  private async fallbackToLocalStorage(key: string, data: any): Promise<void> {
    try {
      console.warn(`IndexedDB不可用，降级使用localStorage存储: ${key}`);
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`使用localStorage存储失败: ${key}`, error);
      throw error;
    }
  }
  
  // 从localStorage回退读取
  private fallbackFromLocalStorage<T>(key: string): T | null {
    try {
      console.warn(`尝试从localStorage读取: ${key}`);
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`从localStorage读取失败: ${key}`, error);
      return null;
    }
  }
}

// 导出单例
export const imageCacheService = new ImageCacheService(); 