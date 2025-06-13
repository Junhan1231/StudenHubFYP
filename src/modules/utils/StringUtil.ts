export function formatPhone(phone:string) {

    let trim: string = phone.replace(/\s+/g,'');
    const result = [
        trim.slice(0, 3),  // 第1段：前三位
        trim.slice(3, 6),  // 第2段：第4到第6位
        trim.slice(6, 10), 
    ].filter(item => !!item).join(' '); 
    return result;
}

export function replaceBlank(phone: string):string{
    return phone ? phone.replace(/\s+/g,''):'';
}