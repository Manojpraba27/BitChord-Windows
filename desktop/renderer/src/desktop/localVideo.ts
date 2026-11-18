let current:HTMLVideoElement|null=null;
export function setLocalVideo(v:HTMLVideoElement|null){current=v;}
export function getLocalVideo(){return current;}
