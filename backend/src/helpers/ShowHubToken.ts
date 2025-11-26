import Setting from "../models/Setting";

export const showHubToken = async (companyId: string): Promise<string> => {

    const hubToken = await Setting.findOne({
        where: { key: "hubToken", companyId }
    });

    if (!hubToken?.value || typeof hubToken?.value !== 'string') {
        throw new Error("Notificame Hub token not found");
    }

    return hubToken.value;
};
