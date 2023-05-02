export const LocalStorageKeys = {
  commute: "commute",
  social: "social",
  toHome: "toHome",
  week02: "week02",
  week41: "week41",
  week61: "week61",
};

const LocalStorageSingleton = (() => {
  let instance;

  function createInstance() {
    // 封装 localStorage 的方法
    const setItem = (key, value) => {
      localStorage.setItem(key, JSON.stringify(value));
    };

    const getItem = (key) => {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    };

    const removeItem = (key) => {
      localStorage.removeItem(key);
    };

    // 返回封装后的 localStorage 对象
    return {
      setItem,
      getItem,
      removeItem,
    };
  }

  return {
    getInstance: () => {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    },
  };
})();

export default LocalStorageSingleton;
