// Preserve existing saved brand URLs while serving the original vector artwork.
export function brandLogoUrl(url){
  return url==='/brand/romina-logo.png'?'/brand/romina-logo.svg':url;
}
