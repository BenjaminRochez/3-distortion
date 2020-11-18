uniform float time;
uniform float progress;
varying vec2 vUv;
varying vec3 vPosition;
uniform vec2 pixels;
float PI = 3.141592653589793238;
void main() {
  vec3 pos = position;

  //pos.z = 0.1*sin(pos.x*10.);

  // distance between the point and the center
  float distance = length(uv - vec2(0.5));
  //length of the vertex
  float maxdist = length(vec2(0.5));
  //normalization
  float normalizedDistance = distance/maxdist;

  float stickTo = normalizedDistance;

  //https://youtu.be/5zuyptdjnmA?t=1589
  float mySuperDuperProgress = min(2.*progress, 2.*(1. - progress));
  float zOffset = 2.;
  float zprogress = clamp(2.*progress, 0., 1.);
  pos.z += zOffset*(stickTo * mySuperDuperProgress - zprogress);

  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
}