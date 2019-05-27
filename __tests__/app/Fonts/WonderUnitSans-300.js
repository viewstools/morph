import { injectGlobal } from 'emotion'
import eot from './WonderUnitSans-300.eot'
import truetype from './WonderUnitSans-300.ttf'
import woff from './WonderUnitSans-300.woff'
import woff2 from './WonderUnitSans-300.woff2'

injectGlobal(`@font-face {
  font-family: 'WonderUnitSans';
  font-style: normal;
  font-weight: 300;
  src: url(${eot}) format('eot'), url(${truetype}) format('truetype'), url(${woff}) format('woff'), url(${woff2}) format('woff2');
}`)
