export const isValidEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

export const validateEntity = (
    data: any,
    context: "employee" | "role" | "client" | "appointment" | "login" | "service" | "company" | "changed" | "category" | "image",
) => {
    
    switch (context) {
        case "login":
            if (!data.email || !isValidEmail(data.email) || data.email.trim() === "") {
                return { valid: false, message: "Por favor, introduce un correo electrónico válido." };
            }
            if (!data.password || data.password.trim() === "") {
                return { valid: false, message: "Por favor, introduce una contraseña." };
            }
            if (data.password.length < 6) {
                return { valid: false, message: "Por favor, introduce una contraseña válida." };
            }            
            break;

        case "category":
            if (!data.name || data.name.trim() === "") {
                return { valid: false, message: "Por favor, introduce un nombre para el rol." };
            }
            if(data.name.length > 20) {
                return { valid: false, message: "Por favor, el nombre del rol supera el límite de 20 caracteres." };
            }
            break;

        case "client":
            if (!data.name || data.name.trim() === "") {
                return { valid: false, message: "Por favor, introduce un nombre del cliente." };
            }
            if(data.name.length > 30) {
                return { valid: false, message: "Por favor, el nombre del cliente supera el límite de 30 caracteres." };
            }            
            if (!data.email || !isValidEmail(data.email) || data.email.trim() === "") {
                return { valid: false, message: "Por favor, introduce un correo electrónico válido." };
            }
            if (!data.phone || data.phone.trim() === "" || data.phone.length < 10 || !/^\+\d{1,3}\d{4,14}$/.test(data.phone)) {
                return { valid: false, message: "Por favor, introduce el teléfono del cliente. Ej: +1234567890" };
            }
            if (!data.DNI || data.DNI.length < 4 || data.DNI.trim() === "") {
                return { valid: false, message: "Por favor, introduce un número de cédula válido." };
            }
            break;

        case "service":
            if (!data.name || data.name.trim() === "") {
                return { valid: false, message: "Por favor, introduce un nombre para el servicio." };
            }
            if(data.name.length > 30) {
                return { valid: false, message: "Por favor, el nombre del servicio supera el límite de 30 caracteres." };
            }            
            if (!data.description || data.description.trim() === "") {
                return { valid: false, message: "Por favor, introduce una descripción para el servicio." };
            }
            if(data.description.length > 150) {
                return { valid: false, message: "Por favor, la descripción del servicio supera el límite de 150 caracteres." };
            }            
            if (typeof data.price !== "number" || data.price <= 0) {
                return { valid: false, message: "Por favor, introduce un precio válido." };
            }
            if (!data.category) {
                return { valid: false, message: "Por favor, asigna una categoría." };
            }
            break;

        case "company":
            if (!data.name || data.name.trim() === "") {
                return { valid: false, message: "Por favor, introduce el nombre de la empresa." };
            }
            if(data.name.length > 30) {
                return { valid: false, message: "Por favor, el nombre de la empresa supera el límite de 30 caracteres." };
            }
            if(!data.description || data.description.trim() === "") {
                return { valid: false, message: "Por favor, introduce la descripción de la empresa." };
            }
            if(data.description.length > 300) {
                return { valid: false, message: "Por favor, la descripción de la empresa supera el límite de 300 caracteres." };
            }
            if(!data.rif || data.rif.trim() === "" || !/^[JVEPG][0-9]{7,8}-[0-9]$/.test(data.rif)) {
                return { valid: false, message: "Por favor, introduce un RIF de la empresa válido. Ej: J12345678-9" };
            }
            if (!data.email || !isValidEmail(data.email) || data.email.trim() === "") {
                return { valid: false, message: "Por favor, introduce un correo electrónico de la empresa válido." };
            }
            if (!data.phone || data.phone.trim() === "" || data.phone.length < 10 || !/^\+\d{1,3}\d{4,14}$/.test(data.phone)) {
                return { valid: false, message: "Por favor, introduce un número de teléfono válido. Ej: +1234567890" };
            }
            if(data.workingDays.length === 0) {
                return { valid: false, message: "Por favor, selecciona al menos un día de atención." }
            }
            if (data.openingHour >= data.closingHour) {
                return { valid: false, message: "La hora de apertura debe ser anterior a la hora de cierre." };
            }
            break;

        case "changed":
            if (typeof data.dataBefore !== "object" || typeof data.dataAfter !== "object" || data.dataBefore === null || data.dataAfter === null) {
                return { valid: false };
            }
            const keys1 = Object.keys(data.dataBefore);
            const keys2 = Object.keys(data.dataAfter);
            if (keys1.length !== keys2.length) {
                return { valid: false };
            }
            for (const key of keys1) {
                if (data.dataBefore[key] !== data.dataAfter[key]) {
                    return { valid: false };
                }
            }
            break;
            
        case "image":
            const validTypes = ['image/png', 'image/jpeg' , 'image/jpg', 'image/webp'];
            if (!validTypes.includes(data.file.type)) {                
                return { valid: false, message: "El formato de la imagen debe ser PNG, JPEG JPG o WEBP." }
            }
    
            const maxSize = 2 * 1024 * 1024; 
            if (data.file.size > maxSize) {
                return { valid: false, message: "El tamaño máximo de la imagen debe ser 2 MB." }
            }
            break;

        default:
            return { valid: false, message: "Contexto no válido." };
    }

    return { valid: true };
};