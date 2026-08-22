import { choose, randomInt } from '../utils/random.js';
import { assertQuestion } from '../utils/validation.js';

const fi = n => n < 0 ? '(' + n + ')' : String(n);
const sign = n => n > 0 ? 'Positive' : n < 0 ? 'Negative' : 'Zero';
const binary = n => n.toString(2);
const number = (r, min, max) => randomInt(min, max, r);
const nonzero = r => { let n = 0; while (n === 0) n = number(r, -9, 9); return n; };
const question = (lessonId, difficulty, templateId, prompt, math, answer, metadata, explanation, supportText, check) => ({
  lessonId, difficulty, templateId, prompt, questionKatex: math, answerKatex: answer, metadata,
  explanation: explanation || '', supportText: supportText || '',
  signature: lessonId + ':' + templateId + ':' + JSON.stringify(metadata), validate: check || (() => true)
});
const direct = (id, d, t, r, operation) => {
  const a = number(r, -9, 9), b = number(r, -9, 9), result = operation(a, b);
  return question(id, d, t, 'Calculate.', fi(a) + (operation === multiply ? '\\times' : operation === subtract ? '-' : '+') + fi(b) + '=?', '\\boxed{' + result + '}', { a, b, result }, '', '', m => m.result === operation(m.a, m.b));
};
const add = (a,b) => a + b;
const subtract = (a,b) => a - b;
const multiply = (a,b) => a * b;

function l01(id,d,t,r) {
  if(t==='E1') return direct(id,d,t,r,add);
  if(t==='E2') { const a=number(r,-12,12),b=number(r,-12,12),s=a+b; return question(id,d,t,'Positive, Negative or Zero?',fi(a)+'+'+fi(b),'\\boxed{\\text{'+sign(s)+'}}',{a,b,s},'', '',m=>sign(m.s)===sign(m.a+m.b)); }
  if(t==='C1') { const A=number(r,4,8),B=number(r,1,A-1),a=-A,b=choose([-B,B],r); return question(id,d,t,'Find one possible pair.','|a|='+A+',\\quad |b|='+B+',\\quad a+b<0','\\boxed{(a,b)=('+a+','+b+')}',{a,b,A,B},'The signs must make the sum negative.','和为负数。',m=>Math.abs(m.a)===m.A&&Math.abs(m.b)===m.B&&m.a+m.b<0); }
  let a=nonzero(r),b=nonzero(r); while(Math.sign(a)===Math.sign(b)||Math.abs(a)===Math.abs(b)){a=nonzero(r);b=nonzero(r);} const s=a+b; return question(id,d,t,'Without calculating exactly: Positive or Negative?',fi(a)+'+'+fi(b),'\\boxed{\\text{'+sign(s)+'}}',{a,b,s},'The addend with greater absolute value decides the sign.','绝对值较大的加数决定符号。',m=>Math.sign(m.s)===Math.sign(Math.abs(m.a)>Math.abs(m.b)?m.a:m.b));
}
function l02(id,d,t,r) {
  if(t==='E1'){const a=-number(r,3,8),b=number(r,1,5),c=-a,e=number(r,1,5);return question(id,d,t,'Which two numbers should you add first?',a+'+'+b+'+'+c+'+'+e,'\\boxed{'+a+'\\text{ and }'+c+'}',{a,b,c,e},'They make zero.','先凑零。',m=>m.a+m.c===0);}
  if(t==='E2'){const a=choose([1.2,2.3,5.6,7.5],r),b=10-a,c=number(r,1,3);return question(id,d,t,'Calculate mentally.',a+'+'+b+'-'+c+'=?','\\boxed{'+(a+b-c)+'}',{a,b,c},'Make 10 first.','先凑整。',m=>m.a+m.b===10);}
  if(t==='C1'){const a=number(r,12,28),b=-number(r,12,20),c=-b,e=-a;return question(id,d,t,'Which arrangement is more efficient?',a+'+('+b+')+'+c+'+('+e+')','\\boxed{('+a+'+'+e+')+('+b+'+'+c+')} ',{a,b,c,e},'Pair opposite numbers first.','先配对相反数。',m=>m.a+m.e===0&&m.b+m.c===0);}
  const a=-number(r,3,8);return question(id,d,t,'Correct or just less efficient?',a+'+7+'+(-a)+'=('+a+'+7)+'+(-a),'\\boxed{\\text{Correct, but less efficient.}}',{a},'Associative Law keeps the value unchanged.','结果正确，但不够简便。',m=>m.a+7-m.a===7);
}
function l03(id,d,t,r) {
  if(t==='E1') return direct(id,d,t,r,subtract);
  if(t==='E2'){const a=nonzero(r),b=nonzero(r);return question(id,d,t,'Rewrite as addition.',fi(a)+'-'+fi(b),'\\boxed{'+fi(a)+'+'+fi(-b)+'}',{a,b},'Add the opposite of the subtrahend.','减去一个数，等于加它的相反数。',m=>m.a-m.b===m.a+(-m.b));}
  if(t==='C1')return question(id,d,t,'Correct or Incorrect?','-4-(-7)=-4+(-7)','\\boxed{\\text{Incorrect}}',{},'Change subtraction to addition and change the subtrahend to its opposite.','减号变加号，减数也要变相反数。');
  return question(id,d,t,'Which is larger?','a-b<0','\\boxed{a<b}',{},'A negative difference means the first number is smaller.','差为负数，前一个数较小。');
}
function l04(id,d,t,r) {
  if(t==='E1'){const a=number(r,-8,8),b=number(r,-8,8),c=number(r,-8,8),e=number(r,-8,8);return question(id,d,t,'Calculate.',fi(a)+'+'+fi(b)+'-'+fi(c)+'+'+fi(e)+'=?','\\boxed{'+(a+b-c+e)+'}',{a,b,c,e},'', '',m=>m.a+m.b-m.c+m.e===m.a+m.b-m.c+m.e);}
  if(t==='E2'){const a=number(r,-6,1),b=number(r,2,8),dist=Math.abs(a-b);return question(id,d,t,'Find the Distance.','A='+a+',\\quad B='+b,'\\boxed{AB='+dist+'}',{a,b,dist},'Distance is always non-negative.','距离非负。',m=>m.dist===Math.abs(m.a-m.b));}
  if(t==='C1'){const a=number(r,-6,2),dist=number(r,3,7);return question(id,d,t,'Where can B be?','A='+a+',\\quad AB='+dist,'\\boxed{B='+(a+dist)+'\\text{ or }'+(a-dist)+'}',{a,dist},'A point at this distance can be on either side.','两侧都有可能。',m=>m.dist>0);}
  return question(id,d,t,'Which expression always gives Distance AB?','A=a,\\quad B=b','\\boxed{|a-b|}',{},'Distance cannot be negative.','距离不能为负。');
}
function l05(id,d,t,r) {
  if(t==='E1') return direct(id,d,t,r,multiply);
  if(t==='E2'){const n=choose([-3,-4,2,3,5],r),den=choose([2,3,4,5],r);return question(id,d,t,'What is its Reciprocal?','\\frac{'+n+'}{'+den+'}','\\boxed{\\frac{'+den+'}{'+n+'}}',{n,den},'Reciprocal multiplies to 1.','倒数相乘得1。',m=>m.n!==0&&m.den!==0);}
  if(t==='C1')return question(id,d,t,'Positive, Negative or Zero?','a<0,\\quad b>0,\\quad ab=?','\\boxed{\\text{Negative}}',{},'Different signs give a negative product.','异号相乘得负。');
  return question(id,d,t,'Opposite and Reciprocal?','-\\frac{3}{4}','\\boxed{\\text{Opposite}=\\frac{3}{4},\\quad\\text{Reciprocal}=-\\frac{4}{3}}',{},'Opposite changes sign; reciprocal flips numerator and denominator.','相反数变号，倒数颠倒分子分母。');
}
function l06(id,d,t,r) {
  if(t==='E1'){const a=nonzero(r),b=nonzero(r),c=nonzero(r),p=a*b*c;return question(id,d,t,'Positive, Negative or Zero?',fi(a)+'\\times'+fi(b)+'\\times'+fi(c),'\\boxed{\\text{'+sign(p)+'}}',{a,b,c,p},'', '',m=>m.p===m.a*m.b*m.c);}
  if(t==='E2')return question(id,d,t,'Which two factors first?','(-25)\\times(-4)\\times3','\\boxed{(-25)\\times(-4)}',{},'Their product is 100.','先凑整。');
  if(t==='C1')return question(id,d,t,'How many negative Factors could there be?','\\text{Four non-zero factors have a negative product.}','\\boxed{1\\text{ or }3}',{},'An odd number of negative factors gives a negative product.','负因数个数为奇数。');
  return question(id,d,t,'Which law is most useful?','(-9)\\times12+(-9)\\times(-2)','\\boxed{\\text{Distributive Law}}',{},'Factor out the common factor.','提取公因数。');
}
function l07(id,d,t,r) {
  if(t==='E1'){const b=nonzero(r),k=number(r,-8,8),a=b*k;return question(id,d,t,'Calculate.',fi(a)+'\\div'+fi(b)+'=?','\\boxed{'+k+'}',{a,b,k},'', '',m=>m.b!==0&&m.a/m.b===m.k);}
  if(t==='E2')return question(id,d,t,'Rewrite as multiplication.','6\\div\\left(-\\frac{2}{3}\\right)','\\boxed{6\\times\\left(-\\frac{3}{2}\\right)}',{},'Multiply by the reciprocal.','乘以除数的倒数。');
  if(t==='C1')return question(id,d,t,'Which operation is allowed?','0\\div5\\qquad5\\div0','\\boxed{0\\div5}',{},'Division by zero is undefined.','除数不能为0。');
  return question(id,d,t,'What can you say about their signs?','a\\div b<0','\\boxed{\\text{Different signs}}',{},'A negative quotient has different signs.','商为负，异号。');
}
function l08(id,d,t,r) {
  if(t==='E1'){const a=number(r,-8,8),b=number(r,-6,6),c=nonzero(r);return question(id,d,t,'Calculate.',fi(a)+'+'+fi(b)+'\\times'+fi(c)+'=?','\\boxed{'+(a+b*c)+'}',{a,b,c},'', '',m=>m.a+m.b*m.c===m.a+m.b*m.c);}
  if(t==='E2')return question(id,d,t,'What comes first?','24\\div6\\times2','\\boxed{24\\div6}',{},'Same-level operations go left to right.','同级运算从左到右。');
  if(t==='C1')return question(id,d,t,'Correct or Incorrect?','24\\div6\\times2=24\\div12','\\boxed{\\text{Incorrect}}',{},'Division and multiplication go from left to right.','同级运算从左到右。');
  return question(id,d,t,'Can we calculate the last two factors first?','-2.5\\div4\\times(-2)','\\boxed{\\text{No}}',{},'Before rewriting as multiplication, use left to right.','未统一成乘法前，按从左到右。');
}
function l09(id,d,t,r) {
  const a=choose([-4,-3,-2,2,3],r),n=number(r,2,4);
  if(t==='E1')return question(id,d,t,'Calculate.','('+a+')^'+n+'=?','\\boxed{'+(a**n)+'}',{a,n},'', '',m=>m.a**m.n===m.a**m.n);
  if(t==='E2')return question(id,d,t,'Base and Exponent?','('+a+')^'+n,'\\boxed{\\text{Base}='+a+',\\quad\\text{Exponent}='+n+'}',{a,n},'', '',m=>Number.isInteger(m.a)&&Number.isInteger(m.n));
  if(t==='C1')return question(id,d,t,'Same or Different?','(-2)^4\\qquad-2^4','\\boxed{\\text{Different: }16\\text{ and }-16}',{},'The brackets change the base.','括号改变底数。');
  return question(id,d,t,'Odd or Even?','(-1)^n=-1','\\boxed{\\text{Odd}}',{},'Only an odd exponent keeps the negative sign.','奇次幂为负。');
}
function l10(id,d,t,r) {
  if(t==='E1'){const a=choose([-3,-2,2,3],r),b=number(r,-4,4),c=number(r,-4,4);return question(id,d,t,'Calculate.','('+a+')^2+'+fi(b)+'\\times'+fi(c)+'=?','\\boxed{'+(a*a+b*c)+'}',{a,b,c},'', '',m=>m.a*m.a+m.b*m.c===m.a*m.a+m.b*m.c);}
  if(t==='E2')return question(id,d,t,'What comes first?','-5^2+3\\times4','\\boxed{5^2}',{},'Calculate powers before multiplication and addition.','先算乘方。');
  if(t==='C1')return question(id,d,t,'Correct or Incorrect?','-5^2=(-5)^2=25','\\boxed{\\text{Incorrect}}',{},'The exponent applies before the leading negative sign.','先乘方，后取相反数。');
  return question(id,d,t,'What is the next number?','-2,\\quad4,\\quad-8,\\quad16,\\quad?','\\boxed{-32}',{},'Each term is multiplied by −2.','每次乘以−2。');
}
function l11(id,d,t,r) {
  if(t==='E1'){const a=choose([12,23,58,76],r),n=number(r,3,6),value=a*10**(n-1);return question(id,d,t,'Write in scientific notation.',String(value),'\\boxed{'+(a/10)+'\\times10^'+n+'}',{a,n,value},'', '',m=>Math.abs(m.a/10*10**m.n-m.value)<1e-8);}
  if(t==='E2'){const a=choose([1.2,3.2,5.8,9.1],r),n=number(r,3,6);return question(id,d,t,'Write in standard form.',a+'\\times10^'+n,'\\boxed{'+(a*10**n)+'}',{a,n},'', '',m=>m.a*10**m.n===m.a*10**m.n);}
  if(t==='C1')return question(id,d,t,'Is this valid scientific notation?','0.58\\times10^7','\\boxed{\\text{No}}',{},'The coefficient must satisfy 1 ≤ |a| < 10.','系数绝对值应在1到10之间。');
  return question(id,d,t,'Which is larger?','9.5\\times10^6\\qquad1.2\\times10^7','\\boxed{1.2\\times10^7}',{},'The power of ten is larger.','10的幂更大。');
}
function l12(id,d,t,r) {
  if(t==='E1'){const x=choose([3.146,5.274,7.891,2.005],r),ans=Math.round(x*100)/100;return question(id,d,t,'Round to the nearest hundredth.',String(x),'\\boxed{'+ans.toFixed(2)+'}',{x,ans},'Look at the thousandths digit.','看千分位。',m=>m.ans===Math.round(m.x*100)/100);}
  if(t==='E2')return question(id,d,t,'What is the Precision?','4.70','\\boxed{\\text{Nearest hundredth}}',{},'The final zero shows hundredths precision.','末尾的0表示精确到百分位。');
  if(t==='C1')return question(id,d,t,'Same value? Same Precision?','1.8\\qquad1.80','\\boxed{\\text{Same value, different precision}}',{},'Trailing zero changes precision, not value.','末尾0改变精确度，不改变数值。');
  return question(id,d,t,'Which could be the original number?','\\text{Rounds to }7.3\\text{ to the nearest tenth}','\\boxed{7.26}',{x:7.26},'Numbers from 7.25 up to 7.35 round to 7.3.','范围是7.25到7.35之间。',m=>Math.round(m.x*10)/10===7.3);
}
function l13(id,d,t,r) {
  if(t==='E1'){const n=number(r,2,31);return question(id,d,t,'Convert to decimal.','('+binary(n)+')_2=?','\\boxed{'+n+'}',{n},'', '',m=>parseInt(binary(m.n),2)===m.n);}
  if(t==='E2'){const n=number(r,2,31);return question(id,d,t,'Convert to binary.',n+'=(?)_2','\\boxed{('+binary(n)+')_2}',{n},'', '',m=>parseInt(binary(m.n),2)===m.n);}
  if(t==='C1'){const n=choose([18,22,26,29],r),power=2**(binary(n).length-1);return question(id,d,t,'What Place Value does the leftmost 1 represent?','('+binary(n)+')_2','\\boxed{'+power+'}',{n,power},'It is the highest power of 2.','最高位表示最大的2的幂。',m=>m.power===2**(binary(m.n).length-1));}
  const a=choose([3,5,6,9],r),b=choose([2,3,5,6],r),s=a+b;return question(id,d,t,'Add in binary.','('+binary(a)+')_2+('+binary(b)+')_2','\\boxed{('+binary(s)+')_2}',{a,b,s},'Carry when reaching 2.','逢二进一。',m=>m.s===m.a+m.b);
}
const factories={L01:l01,L02:l02,L03:l03,L04:l04,L05:l05,L06:l06,L07:l07,L08:l08,L09:l09,L10:l10,L11:l11,L12:l12,L13:l13};
export const GENERATORS=Object.fromEntries(Object.entries(factories).map(([id,factory])=>[id,{factory,templates:{easy:['E1','E2'],challenge:['C1','C2']}}]));
export function generateQuestion(lessonId,difficulty,options={}){const record=GENERATORS[lessonId];if(!record)throw new RangeError('Unknown lesson');const ids=record.templates[difficulty];if(!ids)throw new RangeError('Unknown difficulty');const random=options.random||Math.random;let result;for(let i=0;i<12;i+=1){result=record.factory(lessonId,difficulty,options.forceTemplate||choose(ids,random),random);if(result.signature!==options.previousSignature)break;}return assertQuestion(result);}
export function validateGeneratedQuestion(question){return Boolean(question&&question.validate&&question.validate(question.metadata));}
