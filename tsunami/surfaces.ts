import * as THREE from 'three';

export function coastMaterial(kind: 'sand' | 'rock') {
  const shore = {value:-2};
  const material = new THREE.MeshStandardMaterial({color:kind === 'sand' ? '#ecc385' : '#a9967d',roughness:1});
  material.onBeforeCompile = shader => {
    shader.uniforms.shore = shore;
    shader.vertexShader = 'varying vec3 coastPoint;\n'+shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\ncoastPoint = (modelMatrix * vec4(position,1.0)).xyz;');
    shader.fragmentShader = 'varying vec3 coastPoint; uniform float shore;\n'+shader.fragmentShader.replace('#include <color_fragment>', `
      #include <color_fragment>
      vec3 p = coastPoint;
      float grain = fract(sin(dot(floor(p*95.0),vec3(12.9898,78.233,43.31)))*43758.5453);
      float mottling = sin(p.x*6.0+p.z*3.1)*sin(p.z*5.5-p.x*2.0);
      ${kind === 'sand' ? `
        float wet = smoothstep(-2.18,-1.93,p.x)*(1.0-smoothstep(shore-.07,shore+.14,p.x));
        diffuseColor.rgb *= (0.91+grain*.15+mottling*.035)*mix(vec3(1.0),vec3(.59,.49,.37),wet);
        float scrub = smoothstep(7.0,12.0,-p.z+2.0*sin(p.x*.45));
        diffuseColor.rgb = mix(diffuseColor.rgb,vec3(.21,.32,.13)*(1.0+.22*sin(p.x*1.8+p.z)),scrub);
      ` : `
        float strata = sin(23.0*p.y+2.7*sin(p.x*.8)+1.4*sin(p.z*.6));
        diffuseColor.rgb *= .83+.14*strata+.12*grain+.08*mottling;
      `}
    `);
  };
  material.customProgramCacheKey = () => kind;
  return {material, shore};
}

export function seaMaterial() {
  const time = {value:0};
  const contact = {value:1};
  const material = new THREE.MeshStandardMaterial({
    vertexColors:true, side:THREE.DoubleSide, roughness:.46,
    emissive:'#054662', emissiveIntensity:.25,
  });
  material.onBeforeCompile = shader => {
    shader.uniforms.seaTime = time; shader.uniforms.boatContact = contact;
    shader.vertexShader = 'varying vec3 seaPoint;\n'+shader.vertexShader.replace('#include <begin_vertex>',
      '#include <begin_vertex>\nseaPoint = (modelMatrix * vec4(position,1.0)).xyz;');
    shader.fragmentShader = 'varying vec3 seaPoint; uniform float seaTime; uniform float boatContact;\n'+shader.fragmentShader.replace('#include <color_fragment>', `
      #include <color_fragment>
      vec2 p = seaPoint.xz;
      vec2 relative = p-vec2(-.55,4.75);
      vec2 boat = mat2(.847,.531,-.531,.847)*relative;
      float hull = exp(-3.0*dot(boat/vec2(1.45,.38),boat/vec2(1.45,.38)));
      float floaters = exp(-19.0*pow(abs(boat.y)-.83,2.0))*exp(-1.6*pow(boat.x,4.0));
      diffuseColor.rgb *= 1.0-boatContact*(.44*hull+.22*floaters);
      float warp = sin(p.y*4.3 + seaTime*.75) + .46*sin(p.y*11.0 - seaTime*1.4);
      float ripple = sin(p.x*27.0+p.y*2.3+warp*1.65-seaTime*4.3);
      float group = .5+.25*sin(p.x*4.2-p.y*2.8+seaTime*1.65)+.25*sin(p.y*8.9+p.x*6.3);
      float crest = smoothstep(.83,.995,ripple)*smoothstep(.48,.86,group);
      float visibility = 1.0-smoothstep(16.0,42.0,length(vViewPosition));
      diffuseColor.rgb *= 1.0 + .035*ripple*visibility;
      diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.42,.68,.66),crest*visibility*.38);
    `);
  };
  return {material,time,contact};
}

