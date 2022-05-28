import { signURL } from '../dist/signature.js';

const url = 'http://ecs.aliyuncs.com/?Timestamp=2016-02-23T12:46:24Z&Format=XML&AccessKeyId=testid&Action=DescribeRegions&SignatureMethod=HMAC-SHA1&SignatureNonce=3ee8c1b8-83d3-44af-a94f-4e0ad82fd6cf&Version=2014-05-26&SignatureVersion=1.0'

const secret = 'testsecret&'

const expect = 'OLeaidS1JvxuMvnyHOwuJ+uX5qY='

console.log(signURL(url, 'GET', secret) === expect)