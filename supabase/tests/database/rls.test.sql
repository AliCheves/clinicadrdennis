-- Pruebas de RLS por rol (Fase 0.5). Datos 100 % ficticios.
begin;
create extension if not exists pgtap with schema extensions;
select plan(28);

-- Preparación (como postgres, sin RLS) -------------------------------------------
insert into auth.users (id, email, aud, role) values
  ('00000000-0000-0000-0000-0000000000d1', 'doctor@prueba.local', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-0000000000a1', 'secretaria@prueba.local', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-0000000000f1', 'sinrol@prueba.local', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-0000000000e1', 'inactiva@prueba.local', 'authenticated', 'authenticated');
insert into public.staff_users (auth_user_id, full_name, role, active) values
  ('00000000-0000-0000-0000-0000000000d1', 'Doctor de Prueba', 'doctor', true),
  ('00000000-0000-0000-0000-0000000000a1', 'Secretaria de Prueba', 'secretaria', true),
  ('00000000-0000-0000-0000-0000000000e1', 'Secretaria Inactiva', 'secretaria', false);
insert into public.patients (id, full_name, phone_e164, dui_encrypted, dui_hash, source) values
  ('10000000-0000-0000-0000-000000000001', 'Paciente de Prueba 01', '+50370000001', '\x01aabbcc', '\x0101', 'semilla'),
  ('10000000-0000-0000-0000-000000000002', 'Paciente de Prueba 02', '+50370000002', null, null, 'semilla');
insert into public.calendar_sync_state (calendar_id) values ('calendario-prueba');

create function pg_temp.como(p_uid uuid) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', json_build_object('sub', p_uid, 'role', 'authenticated')::text, true);
  set local role authenticated;
end $$;

-- Anónimo ------------------------------------------------------------------------
set local role anon;
select throws_ok($$ select * from public.patients $$, '42501', null, 'anónimo: no lee pacientes');
select throws_ok($$ select * from public.appointments $$, '42501', null, 'anónimo: no lee citas');
select throws_ok($$ select public.is_staff() $$, '42501', null, 'anónimo: no ejecuta funciones de rol');
reset role;

-- Autenticado sin rol ------------------------------------------------------------
select pg_temp.como('00000000-0000-0000-0000-0000000000f1');
select is(public.is_staff(), false, 'sin rol: is_staff() es falso');
select is((select count(*) from public.patients)::int, 0, 'sin rol: no ve pacientes');
select is((select count(*) from public.staff_users)::int, 0, 'sin rol: no ve personal');
select throws_ok($$ insert into public.patients (full_name, phone_e164) values ('Paciente de Prueba X', '+50370000099') $$,
  '42501', null, 'sin rol: no crea pacientes');
reset role;

-- Personal inactivo ---------------------------------------------------------------
select pg_temp.como('00000000-0000-0000-0000-0000000000e1');
select is(public.is_staff(), false, 'inactiva: is_staff() es falso');
select is((select count(*) from public.patients)::int, 0, 'inactiva: no ve pacientes');
reset role;

-- Secretaria -----------------------------------------------------------------------
select pg_temp.como('00000000-0000-0000-0000-0000000000a1');
select is(public.is_secretary(), true, 'secretaria: is_secretary()');
select is(public.is_doctor(), false, 'secretaria: no es doctor');
select is((select count(*) from public.patients)::int, 2, 'secretaria: ve pacientes');
select throws_ok($$ select dui_encrypted from public.patients $$, '42501', null, 'secretaria: no lee el DUI cifrado');
select throws_ok($$ select * from public.patients $$, '42501', null, 'secretaria: select * no expone el DUI');
select throws_ok($$ select public.doctor_get_dui('10000000-0000-0000-0000-000000000001') $$,
  '42501', null, 'secretaria: no llama doctor_get_dui()');
select lives_ok($$ insert into public.patients (full_name, phone_e164, source) values ('Paciente de Prueba 03', '+50370000003', 'panel') $$,
  'secretaria: crea pacientes');
select throws_ok($$ delete from public.patients where id = '10000000-0000-0000-0000-000000000002' $$,
  '42501', null, 'secretaria: no borra pacientes');
select is((select count(*) from public.audit_log)::int, 0, 'secretaria: no lee la auditoría');
select throws_ok($$ insert into public.audit_log (action, entity) values ('x', 'y') $$,
  '42501', null, 'secretaria: no inserta en la auditoría directamente');
select throws_ok($$ select * from public.calendar_sync_state $$, '42501', null, 'secretaria: no lee el estado de Calendar');
-- Con RLS, un UPDATE sin política de escritura no falla: no afecta filas. Se comprueba el valor.
update public.availability_rules set slot_capacity = 9;
reset role;
select is((select max(slot_capacity) from public.availability_rules)::int, 1, 'secretaria: no edita el horario');

-- Doctor -----------------------------------------------------------------------------
select pg_temp.como('00000000-0000-0000-0000-0000000000d1');
select is(public.is_doctor(), true, 'doctor: is_doctor()');
select is(public.doctor_get_dui('10000000-0000-0000-0000-000000000001'), '\x01aabbcc'::bytea,
  'doctor: obtiene el DUI cifrado con doctor_get_dui()');
select is((select count(*) from public.audit_log where action = 'dui_revelado'
           and entity_id = '10000000-0000-0000-0000-000000000001'
           and actor_id = '00000000-0000-0000-0000-0000000000d1')::int, 1,
  'doctor: ver el DUI deja auditoría con su identidad');
select throws_ok($$ select dui_encrypted from public.patients $$, '42501', null, 'doctor: tampoco lee la columna directamente');
select throws_ok($$ update public.audit_log set action = 'otro' $$, '42501', null, 'doctor: no edita la auditoría');
select throws_ok($$ delete from public.audit_log $$, '42501', null, 'doctor: no borra la auditoría');
select lives_ok($$ update public.availability_rules set slot_capacity = 1 where weekday = 1 $$, 'doctor: edita el horario');
reset role;

select * from finish();
rollback;
