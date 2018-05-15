#!/usr/bin/perl
# 説明   : Restconf 枠のタイトル一覧を取得。
# 作成者 : 江野高広
# 作成日 : 2016/06/15

use strict;
use warnings;

use CGI;
use JSON;

use lib '/usr/local/ODLman/lib';
use Common_system;
use Common_sub;
use Access2DB;



#
# 条件の取得。
#
my $cgi = new CGI;
my $parameter_condition = $cgi -> param('condition');

my $sql_additional_condition = '';
if(defined($parameter_condition) && (length($parameter_condition) > 0)){
 $sql_additional_condition = "where vcRestconfTitle like '\%" . &Common_sub::escape_sql($parameter_condition) . "\%' ";
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
my $select_column = 'vcRestconfId,vcRestconfTitle,iRestconfMethod';
my $table = 'T_Restconf';
my $condition = $sql_additional_condition . 'order by iRestconfIndex,iCreateTime';
$access2db -> set_select($select_column, $table, $condition);
my $ref_Restconf = $access2db -> select_array_cols;



$access2db -> close;


my @title_list = ();
foreach my $ref_title (@$ref_Restconf){
 my ($restconf_id, $restconf_title, $restconf_method) = @$ref_title;
 my %title = ();
 $title{'restconf_id'}     = $restconf_id;
 $title{'restconf_title'}  = $restconf_title;
 $title{'restconf_method'} = $restconf_method;
 
 push(@title_list, \%title);
}

my %result = (
 'result' => 1,
 'restconf_title_list' => \@title_list
);

my $json_result = &JSON::to_json(\%result);

print "Content-type: text/plain; charset=UTF-8\n\n";
print $json_result;
