function makeSpan(className: string, content: string) : string {
    return `<span class="${className}">${content}</span>`;
}

function highRisk(content: string) : string {
    return makeSpan("high",content);
}

function medRisk(content: string) : string {
    return makeSpan("med", content);
}

function timeValue(content: string) : string {
    return makeSpan("time", content);
}

function link(href: string, title: string) {
    return `<a href="${href}">${title}</a>`
}