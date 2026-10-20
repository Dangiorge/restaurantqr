export const defaultAppearance=Object.freeze({style:'glass',backgroundUrl:'',useWelcomeBackground:true,overlay:45,panelOpacity:76,blur:18,motion:true});

export function menuAppearance(value={}){
  return {...defaultAppearance,...value};
}

export function appearanceVariables(appearance){
  return {'--rg-veil':appearance.overlay/100,'--rg-panel':appearance.panelOpacity/100,'--rg-blur':`${appearance.blur}px`};
}

export function menuBackground(appearance,welcome,fallback){
  return (appearance.useWelcomeBackground?welcome:appearance.backgroundUrl)||fallback||'';
}
