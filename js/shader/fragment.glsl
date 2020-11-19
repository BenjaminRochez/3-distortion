uniform float time;
uniform float progress;
uniform float speed;
uniform vec2 mouse;
uniform sampler2D tex;
uniform sampler2D texture2;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;
float PI = 3.141592653589793238;
void main()	{
	float normSpeed = clamp(speed*50., 0., 1.);
	//https://youtu.be/5zuyptdjnmA?t=2489
	float mouseDist = length(vUv - mouse);


	float c = smoothstep(0.2, 0., mouseDist);

	 

	vec2 newUV = (vUv - vec2(0.5))*resolution.zw + vec2(0.5);
	vec4 color = texture2D(tex, newUV);

	float r =  texture2D(tex, newUV + 0.05*c*normSpeed).r;
	float g =  texture2D(tex, newUV + 0.03*c*normSpeed).g;
	float b =  texture2D(tex, newUV + 0.01*c*normSpeed).b;

	gl_FragColor = vec4(vUv,0.0,1.);
	gl_FragColor = color;
	gl_FragColor = vec4(normSpeed*mouseDist,0., 0.0,1.);
	gl_FragColor = vec4(c,0., 0.0,1.);
	gl_FragColor = vec4(r,g, b,1.);
	//gl_FragColor = vec4(progress, 0., 0., 1.);
}  