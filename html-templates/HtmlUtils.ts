export function makeSpan(className: string, content: string) : string {
    return `<span class="${className}">${content}</span>`;
}

export function highRisk(content: string) : string {
    return makeSpan("high",content);
}

export function medRisk(content: string) : string {
    return makeSpan("med", content);
}

export function makeTime(content: string) : string {
    return makeSpan("time", content);
}

export function makeLink(href: string, title: string) {
    return `<a href="${href}">${title}</a>`
}