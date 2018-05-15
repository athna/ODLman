#!/usr/bin/perl
# 説明   : ODL にRestconf
# 作成者 : 江野高広
# 作成日 : 2016/06/17
# 更新   : 2016/09/09 XML に対応

use strict;
use warnings;

use CGI;
use JSON;

use lib '/usr/local/ODLman/lib';
use Common_system;
use Access2DB;
use ODLman_common;

my $path_curl_common_pl = &Common_system::curl_common();
require($path_curl_common_pl);



my %restconf_list = ();



#
# restconf id と入力値一覧とdelete flag を受け取る。
#
my $cgi = new CGI;
my $restconf_id     = $cgi -> param('restconf_id');
my $json_value_list = $cgi -> param('json_value_list');
my $flag_delete     = $cgi -> param('delete');

unless(defined($json_value_list) && (length($json_value_list) > 0)){
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print '{"result":0,"reason":"Restconf ID が指定されていません。"}';
 exit(0);
}

my $ref_value_list = &JSON::from_json($json_value_list);



#
# value list から空文字、undef 要素を取り除く。
#
while(my ($input_id, $ref_value) = each(%$ref_value_list)){
 for(my $i = scalar(@{$ref_value}) - 1; $i >= 0; $i --){
  unless(defined($ref_value -> [$i]) && (length($ref_value -> [$i]) > 0)){
   splice(@{$ref_value}, $i, 1);
  }
 }
}



#
# DB アクセスのためのオブジェクトを作成する。
#
my ($DB_name, $DB_host, $DB_user, $DB_password) = &Common_system::DB_connect_parameter();
my @DB_connect_parameter_list                   = ('dbi:mysql:' . $DB_name . ':' . $DB_host, $DB_user, $DB_password);
my $access2db                                   = Access2DB -> open(@DB_connect_parameter_list);



#
# url, method を取得。
#
my ($restconf_url, $method) = &ODLman_common::get_url_method($access2db, $restconf_id, $flag_delete);

$restconf_list{'method'} = $method;




#
# 値の繰り返しタイプを取得。
#
my $ref_value_repeat_type_list = &ODLman_common::get_value_repeat_type($access2db, $restconf_id);



#
# value list のkey をvcInputId からvcInputKey に差し替える。
#
my $select_column = 'vcInputId,vcInputKey';
my $table = 'T_Input';
my $condition = "where vcRestconfId ='" . $restconf_id . "'";
$access2db -> set_select($select_column, $table, $condition);
my $ref_Input = $access2db -> select_hash_col2;

my %new_value_list = ();
while(my ($input_id, $ref_value) = each(%$ref_value_list)){
 my $key = $ref_Input -> {$input_id};
 $new_value_list{$key} = $ref_value;
}



#
# URL を完成させる。
#
my ($tmp_url, $unknown_key) = &ODLman_common::insert_skeleton($restconf_url, 0, $ref_value_repeat_type_list, \%new_value_list, 1);

unless(defined($tmp_url) && (length($tmp_url) > 0)){
 $access2db -> close;
 
 my $json_results = &ODLman_common::make_error_result($unknown_key . " が未定義です。");
 
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print $json_results;
 exit(0);
}

my $url = &ODLman_common::compleat_url($tmp_url);

$restconf_list{'url'} = $url;



#
# JSON を完成させる。
#
if(($method eq 'PUT') || ($method eq 'POST')){
 my $ref_json_list = &ODLman_common::get_json($access2db, $restconf_id);
 my ($json, $unknown_key, $flag_xml) = &ODLman_common::make_json($ref_json_list, $ref_value_repeat_type_list, \%new_value_list);
 
 unless(defined($json)){
  $access2db -> close;
  
  my $json_results = &ODLman_common::make_error_result($unknown_key . " が未定義です。");
  print "Content-type: text/plain; charset=UTF-8\n\n";
  print $json_results;
  exit(0);
 }
 
 $restconf_list{'body'} = $json;
 
 my $content_type = 'json';
 if($flag_xml == 1){
  $content_type = 'xml';
 }
 
 $restconf_list{'content_type'} = $content_type;
}



$access2db -> close;



#
# ODL へアクセス
#
my $curl = &main::gen_curl();
my $ref_summary_list = &main::restconf($curl, [\%restconf_list]);

my %results = ();
$results{'method'} = $ref_summary_list -> [0] -> {'method'};
$results{'url'}    = $ref_summary_list -> [0] -> {'url'};

if(exists($ref_summary_list -> [0] -> {'send_body'})){
 $results{'json'} = $ref_summary_list -> [0] -> {'send_body'};
}
else{
 $results{'json'} = '';
}

if(exists($ref_summary_list -> [0] -> {'response_body'})){
 $results{'result'} = 1;
 $results{'ODL'} = $ref_summary_list -> [0] -> {'response_body'};
}
else{
 $results{'result'} = 0;
 $results{'reason'} = $ref_summary_list -> [0] -> {'error'};
 $results{'ODL'} = '';
}



my $json_result = &JSON::to_json(\%results);

print "Content-type: text/plain; charset=UTF-8\n\n";
print $json_result;
