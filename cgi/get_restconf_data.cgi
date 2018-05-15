#!/usr/bin/perl
# 説明   : Restconf 枠作成のための材料を選ぶ。
# 作成者 : 江野高広
# 作成日 : 2016/06/13

use strict;
use warnings;

use CGI;
use JSON;

use lib '/usr/local/ODLman/lib';
use Common_system;
use Access2DB;



#
# Restconf ID の確認。
#
my $cgi = new CGI;
my $restconf_id = $cgi -> param('restconf_id');

unless(defined($restconf_id) && (length($restconf_id) > 0)){
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print '{"result":0}';
 exit(0);
}



#
# DB アクセスのためのオブジェクトを作成する。
#
my ($DB_name, $DB_host, $DB_user, $DB_password) = &Common_system::DB_connect_parameter();
my @DB_connect_parameter_list                   = ('dbi:mysql:' . $DB_name . ':' . $DB_host, $DB_user, $DB_password);
my $access2db                                   = Access2DB -> open(@DB_connect_parameter_list);



#
# タイトルを取得。 
#
my $select_column = 'vcRestconfTitle,vcRestconfUrl,iRestconfMethod';
my $table = 'T_Restconf';
my $condition = "where vcRestconfId ='" . $restconf_id . "'";
$access2db -> set_select($select_column, $table, $condition);
my $ref_Restconf = $access2db -> select_cols;



#
# JSON を取得。 
#
$select_column = 'vcJsonId,iJsonRepeatType,txJsonText';
$table = 'T_Json';
$condition = "where vcRestconfId ='" . $restconf_id . "' order by iJsonIndex";
$access2db -> set_select($select_column, $table, $condition);
my $ref_Json = $access2db -> select_array_cols;



#
# グループを順番に取り出す。 
#
$select_column = 'vcGroupId';
$table = 'T_Group';
$condition = "where vcRestconfId ='" . $restconf_id . "' order by iGroupIndex";
$access2db -> set_select($select_column, $table, $condition);
my $ref_group_list = $access2db -> select_array_col1;



#
# 値を順番に取り出す。
#
$select_column = 'vcGroupId,vcInputId,vcInputKey,vcInputName,iInputType,vcInputOption';
$table = 'T_Input';
$condition = "where vcRestconfId ='" . $restconf_id . "' order by iInputIndex";
$access2db -> set_select($select_column, $table, $condition);
my $ref_Input = $access2db -> select_array_cols;



$access2db -> close;



#
# json list, restconf list を画面表示に合わせた構造にする。
#
my @json_sort_list = ();
my %json_list = ();
foreach my $ref_row (@$ref_Json){
 my $json_id     = $ref_row -> [0];
 my $json_repeat = $ref_row -> [1];
 my $json_text   = $ref_row -> [2];
 $json_repeat += 0;
 
 push(@json_sort_list, $json_id);
 
 $json_list{$json_id} = {};
 $json_list{$json_id} -> {'repeat'} = $json_repeat;
 $json_list{$json_id} -> {'text'}   = $json_text; 
}

my %input_sort_list = ();
my %input_list = ();
foreach my $ref_row (@$ref_Input){
 my $group_id     = $ref_row -> [0];
 my $input_id     = $ref_row -> [1];
 my $input_key    = $ref_row -> [2];
 my $input_name   = $ref_row -> [3];
 my $input_type   = $ref_row -> [4];
 my $input_option = $ref_row -> [5];
 
 $input_type += 0;
 
 unless(exists($input_sort_list{$group_id})){
  $input_sort_list{$group_id} = [];
 }
 
 push(@{$input_sort_list{$group_id}}, $input_id);
 
 $input_list{$input_id} = {};
 $input_list{$input_id} -> {'key'}  = $input_key;
 $input_list{$input_id} -> {'name'} = $input_name;
 $input_list{$input_id} -> {'type'} = $input_type;
 
 if(($input_type == 1) || ($input_type == 2)){
  $input_list{$input_id} -> {'option'} = $input_option;
 }
 else{
  my $ref_option = &JSON::from_json($input_option);
  $input_list{$input_id} -> {'option'} = $ref_option;
 }
}



#
# 結果をまとめる。
#
my $restconf_title  = $ref_Restconf -> [0];
my $restconf_url    = $ref_Restconf -> [1];
my $restconf_method = $ref_Restconf -> [2];
$restconf_method += 0;
my %result = (
 'result'          => 1,
 'restconf_id'     => $restconf_id,
 'restconf_title'  => $restconf_title,
 'restconf_url'    => $restconf_url,
 'restconf_method' => $restconf_method,
 'json_sort_list'  => \@json_sort_list,
 'json_list'       => \%json_list,
 'group_list'      => $ref_group_list,
 'input_sort_list' => \%input_sort_list,
 'input_list'      => \%input_list
);

my $json_result = &JSON::to_json(\%result);




print "Content-type: text/plain; charset=UTF-8\n\n";
print $json_result;
