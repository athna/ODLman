#!/usr/bin/perl
# 説明   : Curl でRestconf
# 作成者 : 江野高広
# 作成日 : 2016/07/27
# 更新   : 2016/09/09 XML に対応

=pod
【注意】

WWW::Curl::Easy の関数はmain に書かないと挙動がおかしくなる。
例えばURL を定義できない、など。
パッケージ名を明示的に定義せず、このファイルをmain でrequire で呼び出し、
&main::gen_curl();
&main::restconf();
と書いて実行する。

--------------------------------------------------------------------------------
【使い方】メインルーチンで

require(<curl_common.pl のフルパス>);

my $curl = &main::gen_curl();
my $ref_summary_list = &main::restconf($curl, \@restconf_list);


--------------------------------------------------------------------------------
【Basic 認証】

gen_curl() のCURLOPT_USERPWD で指定しているパラメーターを変更する。
ユーザーID:パスワード


--------------------------------------------------------------------------------
【解説】

\@restconf_list の構造

[
 {
  'method' => 'GET' or 'POST' or 'PUT' or 'DELETE' or ...
  'url'    => API のURL
  'body'   => API に送るデータ
 },
 {
  上に同じ
 },
 ...
 ..
 .
]

body は method がGET, DELETE の場合は不要。




$ref_summary_list の構造

[
 {
  'method' => API にアクセスするmethod
  'url'    => API のURL
  'send_body' => API に送ったデータ
  'response_body' => API からの応答
  'response_type' => response_body の形式 json, text, null
  'error' => 通信できなかった、@restconf_list の内容がおかしいなどのエラー
 },
 {
  上に同じ
 },
 ...
 ..
 .
]

send_body はmethod がPOST, PUT のときしかない。
error があるときはresponse_body, response_type は無い。

$ref_summary_list の順番は@restconf_list の順番と同じ。
=cut



use strict;
use warnings;

use JSON;
use WWW::Curl::Easy;


#
# Curl オブジェクトの生成
#
sub gen_curl {
 my $curl = WWW::Curl::Easy -> new;
 $curl -> setopt(CURLOPT_USERPWD, 'admin:admin');
 
 return($curl);
}



#
# Restconf
#
sub restconf {
 my $curl = $_[0];
 my $ref_restconf_list = $_[1];
 my @summary_list = ();
 
 foreach my $ref_method_url_body (@$ref_restconf_list){
  my $method = $ref_method_url_body -> {'method'};
  my $url    = $ref_method_url_body -> {'url'};
  my $content_type = 'json';
  my %summary = ();
  
  if(defined($ref_method_url_body -> {'content_type'}) && (length($ref_method_url_body -> {'content_type'}) > 0)){
   $content_type = $ref_method_url_body -> {'content_type'};
  }
  $curl -> setopt(CURLOPT_HTTPHEADER, ['Content-type: application/' . $content_type]);
  
  $curl -> setopt(CURLOPT_CUSTOMREQUEST, $method);
  $summary{'method'} = $method;
  
  $curl -> setopt(CURLOPT_URL, $url);
  $summary{'url'} = $url;
  
  if(($method eq 'PUT') || ($method eq 'POST')){
   my $body = $ref_method_url_body -> {'body'};
   $curl -> setopt(CURLOPT_POSTFIELDS, $body);
   $summary{'send_body'} = $body;
  }
  else{
   $curl -> setopt(CURLOPT_POSTFIELDS, '');
  }
  
  my $response = undef;
  $curl -> setopt(CURLOPT_WRITEDATA, \$response);
 
  my $retcode = $curl -> perform;
  
  if($retcode == 0){
   if(defined($response) && (length($response) > 0)){
    eval{my $ref_response = &JSON::from_json($response)};
    
    if(length($@) == 0){
     my $python_tool_json = `echo '$response' | python -m json.tool`;
     $summary{'response_body'} = $python_tool_json;
     $summary{'response_type'} = 'json'; 
    }
    elsif(defined($response) && (length($response) > 0)){
     $summary{'response_body'} = $response;
     $summary{'response_type'} = 'text';
    }
   } 
   else{
    $summary{'response_body'} = '';
    $summary{'response_type'} = 'null';
   }
  }
  else{
   $summary{'error'} = 'An error happened: ' . $retcode . ' ' . $curl -> strerror($retcode) . ' ' . $curl -> errbuf;
  }
  
  push(@summary_list, \%summary);
 }
 
 return(\@summary_list);
}

1;
