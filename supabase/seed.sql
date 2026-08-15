-- Fictional SWACHHLENS prototype data. Never presented as an official GIS dataset.
select set_config('app.seed_mode','on',false);

insert into public.teams (id,name,team_type,worker_count,availability,current_location) values
('10000000-0000-0000-0000-000000000001','Alpha Sanitation Crew','Bulk Waste Crew',4,'AVAILABLE','{"latitude":12.9701,"longitude":77.5962}'),
('10000000-0000-0000-0000-000000000002','Flow Response Unit','Drainage & Sanitation',3,'ASSIGNED','{"latitude":12.9641,"longitude":77.5945}'),
('10000000-0000-0000-0000-000000000003','Civic Hazmat 01','Hazmat Response Unit',4,'ASSIGNED','{"latitude":12.9760,"longitude":77.6001}'),
('10000000-0000-0000-0000-000000000004','GreenLoop Recovery','Materials Recovery Team',3,'AVAILABLE','{"latitude":12.9791,"longitude":77.5908}'),
('10000000-0000-0000-0000-000000000005','Market Hygiene Crew','Organic Waste Crew',3,'AVAILABLE','{"latitude":12.9698,"longitude":77.6010}')
on conflict do nothing;
insert into public.vehicles (id,name,vehicle_type,capacity,availability,current_location) values
('20000000-0000-0000-0000-000000000001','Mini Truck MT-12','Mini Truck','2.5 tonne class','AVAILABLE','{"latitude":12.9702,"longitude":77.5961}'),
('20000000-0000-0000-0000-000000000002','Tipper TT-04','Tipper Truck','6 tonne class','AVAILABLE','{"latitude":12.962,"longitude":77.603}'),
('20000000-0000-0000-0000-000000000003','Containment HV-01','Containment Vehicle','Hazard-controlled','ASSIGNED','{"latitude":12.976,"longitude":77.600}'),
('20000000-0000-0000-0000-000000000004','Recovery Van RV-08','Recycling Van','1.5 tonne class','AVAILABLE','{"latitude":12.979,"longitude":77.591}'),
('20000000-0000-0000-0000-000000000005','Utility UV-17','Utility Van','800 kg class','AVAILABLE','{"latitude":12.968,"longitude":77.605}')
on conflict do nothing;

insert into public.incidents (id,display_id,latitude,longitude,address,captured_at,description,status,waste_category,volume_category,action_score,priority_level,location_sensitivity,sensitivity_reason,report_count,score_factors,is_demo) values
('30000000-0000-0000-0000-000000002048','SW-2048',12.9719,77.5949,'School Lane & 4th Cross · Demo City',now()-interval '11 hours','Large construction debris blocking drain beside fictional school.','PRIORITIZED','Construction debris','Large',94,'CRITICAL','HIGH','Fictional Shantivan School (86m)',7,'{"volume":25,"locationSensitivity":25,"reportFrequency":20,"complaintAge":14,"hazardContext":10}',true),
('30000000-0000-0000-0000-000000002049','SW-2049',12.9660,77.6032,'Ring Road Underpass East · Demo City',now()-interval '3.4 hours','Supporting mixed-waste report at the underpass.','AI_ANALYZED','Garbage dump','Medium',48,'MEDIUM','MEDIUM','Major road',1,'{"volume":12,"locationSensitivity":14,"reportFrequency":10,"complaintAge":5,"hazardContext":0}',true),
('30000000-0000-0000-0000-000000002050','SW-2050',12.9761,77.6002,'Service Road 7 · Demo City',now()-interval '1.8 hours','Unlabelled leaking containers.','ASSIGNED','Hazardous waste','Medium',88,'CRITICAL','HIGH','Fictional Arogya Clinic (120m)',2,'{"volume":12,"locationSensitivity":25,"reportFrequency":10,"complaintAge":5,"hazardContext":15}',true),
('30000000-0000-0000-0000-000000002051','SW-2051',12.9695,77.6008,'Central Market Gate 3 · Demo City',now()-interval '7.2 hours','Vegetable waste after market close.','ASSIGNED','Organic waste','Large',86,'CRITICAL','HIGH','Fictional Central Market',9,'{"volume":25,"locationSensitivity":25,"reportFrequency":20,"complaintAge":9,"hazardContext":10}',true),
('30000000-0000-0000-0000-000000002052','SW-2052',12.9781,77.5911,'Canal Walk North · Demo City',now()-interval '18 hours','Plastic packaging along channel edge.','DISPATCHED','Plastic waste','Large',90,'CRITICAL','HIGH','Urban water channel (demo)',5,'{"volume":25,"locationSensitivity":25,"reportFrequency":16,"complaintAge":14,"hazardContext":10}',true),
('30000000-0000-0000-0000-000000002053','SW-2053',12.9655,77.6038,'Ring Road Underpass · Demo City',now()-interval '15 hours','Repeated mixed waste reports.','PRIORITIZED','Garbage dump','Very Large',89,'CRITICAL','MEDIUM','Major road',12,'{"volume":25,"locationSensitivity":14,"reportFrequency":20,"complaintAge":14,"hazardContext":10}',true),
('30000000-0000-0000-0000-000000002054','SW-2054',12.9732,77.5863,'Meadow Block C · Demo City',now()-interval '5 hours','Discarded monitors, cables and batteries.','ACCEPTED','E-waste','Small',55,'MEDIUM','MEDIUM','Residential zone',1,'{"volume":5,"locationSensitivity":14,"reportFrequency":4,"complaintAge":9,"hazardContext":15}',true),
('30000000-0000-0000-0000-000000002055','SW-2055',12.9812,77.5977,'Health District Entry · Demo City',now()-interval '22 hours','Cleanup evidence submitted.','VERIFICATION','Overflowing bin','Medium',73,'HIGH','HIGH','Fictional City Hospital (74m)',4,'{"volume":12,"locationSensitivity":25,"reportFrequency":16,"complaintAge":14,"hazardContext":0}',true),
('30000000-0000-0000-0000-000000002056','SW-2056',12.9638,77.5941,'Monsoon Avenue Junction · Demo City',now()-interval '9 hours','Drain blocked after rainfall.','ON_SITE','Drain blockage','Medium',87,'CRITICAL','HIGH','Major road',6,'{"volume":12,"locationSensitivity":25,"reportFrequency":16,"complaintAge":14,"hazardContext":10}',true),
('30000000-0000-0000-0000-000000002057','SW-2057',12.9681,77.5842,'Garden Street · Demo City',now()-interval '0.8 hours','Plastic bottles beside curb.','PRIORITIZED','Plastic waste','Small',17,'LOW','LOW','Residential zone',1,'{"volume":5,"locationSensitivity":6,"reportFrequency":4,"complaintAge":2,"hazardContext":0}',true),
('30000000-0000-0000-0000-000000002058','SW-2058',12.9749,77.6073,'West Bus Stand · Demo City',now()-interval '6 hours','Food waste behind vendor line.','CLEANUP_IN_PROGRESS','Organic waste','Medium',61,'MEDIUM','MEDIUM','Bus stand',3,'{"volume":12,"locationSensitivity":14,"reportFrequency":10,"complaintAge":9,"hazardContext":10}',true),
('30000000-0000-0000-0000-000000002059','SW-2059',12.9725,77.5955,'School Lane South · Demo City',now()-interval '2.2 hours','Supporting brick and tile report near school drain.','PRIORITIZED','Construction debris','Small',30,'LOW','LOW','Residential zone',1,'{"volume":5,"locationSensitivity":6,"reportFrequency":10,"complaintAge":5,"hazardContext":0}',true),
('30000000-0000-0000-0000-000000002060','SW-2060',12.9673,77.6121,'Old Market Approach · Demo City',now()-interval '30 hours','Recurring mixed waste cleared.','RESOLVED','Garbage dump','Large',83,'HIGH','MEDIUM','Market road',8,'{"volume":25,"locationSensitivity":14,"reportFrequency":20,"complaintAge":14,"hazardContext":10}',true),
('30000000-0000-0000-0000-000000002061','SW-2061',12.9841,77.5884,'Palm Grove 1st Cross · Demo City',now()-interval '4 hours','Small bin overflow cleared.','RESOLVED','Overflowing bin','Small',24,'LOW','LOW','Residential zone',1,'{"volume":5,"locationSensitivity":6,"reportFrequency":4,"complaintAge":9,"hazardContext":0}',true),
('30000000-0000-0000-0000-000000002062','SW-2062',12.9584,77.6004,'Workshop Lane · Demo City',now()-interval '1.2 hours','Broken fluorescent tubes.','AI_ANALYZED','Hazardous waste','Small',76,'HIGH','MEDIUM','Light industrial zone',1,'{"volume":5,"locationSensitivity":14,"reportFrequency":4,"complaintAge":5,"hazardContext":15}',true),
('30000000-0000-0000-0000-000000002063','SW-2063',12.9771,77.6144,'East Flyover Base · Demo City',now()-interval '10 hours','Segregated plastic pile collected.','RESOLVED','Plastic waste','Medium',59,'MEDIUM','MEDIUM','Major road',4,'{"volume":12,"locationSensitivity":14,"reportFrequency":16,"complaintAge":14,"hazardContext":0}',true),
('30000000-0000-0000-0000-000000002064','SW-2064',12.9861,77.6048,'Tech Arcade Rear Gate · Demo City',now()-interval '12 hours','Old printers and computer parts.','ASSIGNED','E-waste','Medium',65,'MEDIUM','LOW','Commercial zone',2,'{"volume":12,"locationSensitivity":6,"reportFrequency":10,"complaintAge":14,"hazardContext":15}',true),
('30000000-0000-0000-0000-000000002065','SW-2065',12.9568,77.5931,'Vidya Road South · Demo City',now()-interval '26 hours','Drain obstruction cleared.','RESOLVED','Drain blockage','Large',84,'HIGH','HIGH','Fictional Vidya School (95m)',5,'{"volume":25,"locationSensitivity":25,"reportFrequency":16,"complaintAge":14,"hazardContext":10}',true),
('30000000-0000-0000-0000-000000002066','SW-2066',12.9705,77.6091,'Flower Market Exit · Demo City',now()-interval '1 hour','Flower and leaf waste.','REPORTED','Organic waste','Small',28,'LOW','MEDIUM','Market',1,'{"volume":5,"locationSensitivity":14,"reportFrequency":4,"complaintAge":5,"hazardContext":0}',true),
('30000000-0000-0000-0000-000000002067','SW-2067',12.9650,77.6043,'Ring Road Underpass West · Demo City',now()-interval '3 hours','Supporting mixed-waste report at the underpass.','PRIORITIZED','Garbage dump','Medium',41,'LOW','MEDIUM','Major road',1,'{"volume":12,"locationSensitivity":6,"reportFrequency":10,"complaintAge":5,"hazardContext":0}',true)
on conflict (id) do nothing;
select setval('public.incident_display_seq',2067,true);

update public.incidents set duplicate_master_id='30000000-0000-0000-0000-000000002053' where id in ('30000000-0000-0000-0000-000000002049','30000000-0000-0000-0000-000000002067');
update public.incidents set duplicate_master_id='30000000-0000-0000-0000-000000002048' where id='30000000-0000-0000-0000-000000002059';

insert into public.ai_analyses (incident_id,waste_categories,confidence_scores,volume_category,volume_confidence,hazard_flags,recommended_action,model_version,is_prototype)
select id,jsonb_build_array(waste_category),jsonb_build_object(waste_category,case when display_id='SW-2048' then .94 else .88 end),volume_category,case when display_id='SW-2048' then .82 else .84 end,
case when waste_category='Hazardous waste' then '["Possible chemical or sharp-material exposure"]'::jsonb when waste_category='Drain blockage' or display_id='SW-2048' then '["Drain blockage detected"]'::jsonb else '[]'::jsonb end,
jsonb_build_object('team_type',case when waste_category='Hazardous waste' then 'Hazmat Response Unit' when waste_category in ('Plastic waste','E-waste') then 'Materials Recovery Team' else 'Standard Cleanup Team' end,'vehicle_type',case when volume_category in ('Large','Very Large') then 'Mini Truck' else 'Utility Van' end,'worker_count',case when volume_category in ('Large','Very Large') then 3 else 2 end,'escalation',case when priority_level='CRITICAL' then 'IMMEDIATE' else 'STANDARD' end),
'swachhlens-prototype-rules-1.0',true from public.incidents where is_demo=true
on conflict do nothing;

insert into public.hotspots (id,name,center_latitude,center_longitude,risk_score,report_count,trend,dominant_category,average_resolution_time,signal,recommendation,is_prototype) values
('50000000-0000-0000-0000-000000000001','Central Market Loop',12.9697,77.602,87,9,24,'Organic waste',13.4,'9 reports in 72 hours · resolution increasing','Increase post-market collection frequency',true),
('50000000-0000-0000-0000-000000000002','Ring Road Underpass',12.9655,77.6038,79,12,18,'Garbage dump',16.1,'4 repeated incidents · mixed waste dominant','Add evening patrol and covered collection point',true),
('50000000-0000-0000-0000-000000000003','North Canal Walk',12.9781,77.5911,72,6,12,'Plastic waste',9.8,'Water-adjacent litter recurrence','Add recovery bin and weekly channel sweep',true)
on conflict do nothing;

with c as (insert into public.duplicate_clusters(id,master_incident_id,similarity_score,detection_reason) values
('60000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000002053',.91,'["Average proximity 84m","Same waste signature","12 reports within 72 hours","9 prototype image matches"]') on conflict do nothing returning id)
insert into public.duplicate_cluster_members(cluster_id,incident_id,similarity_score) values
('60000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000002053',1),
('60000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000002049',.91),
('60000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000002067',.88)
on conflict do nothing;

insert into public.duplicate_clusters(id,master_incident_id,similarity_score,detection_reason) values
('60000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000002048',.84,'["Construction debris category","Within 118m","Similar visible material"]')
on conflict do nothing;
insert into public.duplicate_cluster_members(cluster_id,incident_id,similarity_score) values
('60000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000002048',1),
('60000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000002059',.84)
on conflict do nothing;
select set_config('app.seed_mode','off',false);
