export function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return 'b' + s4() + s4() + s4() +  s4() +s4() +  s4() + s4() + s4();
}
export function distance(x1, x2, y1, y2){
    var a = x1 - x2;
    var b = y1 - y2;
    var c = Math.sqrt( a*a + b*b );
    return c;
}