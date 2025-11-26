import Contact from "../../models/Contact";
import Whatsapp from "../../models/Whatsapp";

interface HubContact {
    name: string;
    firstName: string;
    lastName: string;
    picture: string;
    from: string;
    whatsapp: Whatsapp;
    channel: string;
}

const FindOrCreateContactService = async (
    contact: HubContact
): Promise<Contact> => {
    const { name, picture, firstName, lastName, from, whatsapp, channel } = contact;

    let numberFb;
    let numberIg;
    let contactExists;

    if (channel === 'facebook') {
        numberFb = from;
        contactExists = await Contact.findOne({
            where: {
                messengerId: from,
                companyId: whatsapp.companyId,
            }
        });
    }

    if (channel === 'instagram') {
        numberIg = from;
        contactExists = await Contact.findOne({
            where: {
                instagramPK: from,
                companyId: whatsapp.companyId,
            }
        });
    }

    if (contactExists) {
        await contactExists.update({ name: name || firstName || 'Name Unavailable', firstName, lastName, profilePicUrl: picture });
        return contactExists;
    }

    const newContact = await Contact.create({
        name: name || firstName || '',
        firstName,
        lastName,
        profilePicUrl: picture,
        number: null,
        companyId: whatsapp.companyId,
        messengerId: numberFb || null,
        instagramPK: numberIg || null
    });

    return newContact;
};

export default FindOrCreateContactService;
