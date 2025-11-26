const { DataTypes } = require("sequelize");

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addColumn("Whatsapps", "tokenTelegram", {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    });
    await queryInterface.addColumn("Whatsapps", "instagramUser", {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    });
    await queryInterface.addColumn("Whatsapps", "instagramKey", {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    });
    await queryInterface.addColumn("Whatsapps", "fbPageId", {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    });
    await queryInterface.addColumn("Whatsapps", "fbObject", {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: null
    });
    await queryInterface.addColumn("Whatsapps", "wavoip", {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    });
    // 'type' column might already exist in some versions, checking first or using addColumn safely
    // Based on previous analysis, 'type' column exists but might need enum update or just ensure it handles new values.
    // However, in the provided model file, 'type' was just a string.
    // If it doesn't exist, we add it. If it exists, we leave it (it's a string).
    const tableInfo = await queryInterface.describeTable("Whatsapps");
    if (!tableInfo.type) {
        await queryInterface.addColumn("Whatsapps", "type", {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "whatsapp"
        });
    }
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn("Whatsapps", "tokenTelegram");
    await queryInterface.removeColumn("Whatsapps", "instagramUser");
    await queryInterface.removeColumn("Whatsapps", "instagramKey");
    await queryInterface.removeColumn("Whatsapps", "fbPageId");
    await queryInterface.removeColumn("Whatsapps", "fbObject");
    await queryInterface.removeColumn("Whatsapps", "wavoip");
    // We don't remove 'type' as it might be critical or pre-existing
  }
};
