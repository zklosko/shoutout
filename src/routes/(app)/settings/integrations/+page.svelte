<script lang="ts">
  import { enhance } from '$app/forms';
  import { toast } from '$lib/toast.svelte';
  import SettingsCard from '$lib/components/SettingsCard.svelte';
  import FormField from '$lib/components/FormField.svelte';
  import type { PageProps } from './$types';

  let { data, form }: PageProps = $props();
  let saving = $state(false);
</script>

<h1 class="title">Connections</h1>
<p class="subtitle">Where the approve queue sends numbers once approved.</p>

<SettingsCard title="Companion">
  <form
    method="POST"
    action="?/save"
    use:enhance={() => {
      saving = true;
      return async ({ result, update }) => {
        saving = false;
        await update({ reset: false });
        if (result.type === 'success') {
          toast.success('Companion settings saved.');
        } else if (result.type === 'failure') {
          toast.error((result.data?.error as string) ?? 'Could not save settings.');
        }
      };
    }}
  >
    <div class="field">
      <label class="checkbox">
        <input type="checkbox" name="enabled" checked={data.connection.enabled} />
        Enabled
      </label>
    </div>

    <div class="columns">
      <div class="column">
        <FormField
          id="host"
          name="host"
          type="text"
          label="Host"
          placeholder="192.168.1.51"
          value={form?.host ?? data.connection.host ?? ''}
          required={true}
        />
      </div>
      <div class="column">
        <FormField
          id="port"
          name="port"
          type="number"
          label="Port"
          placeholder="8000"
          value={String(form?.port ?? data.connection.port ?? '')}
          required={true}
        />
      </div>
    </div>

    <p class="has-text-grey is-size-7 mb-2">Button location</p>
    <div class="columns">
      <div class="column">
        <FormField id="page" name="page" type="number" label="Page" value={String(data.settings.page)} required={true} />
      </div>
      <div class="column">
        <FormField id="row" name="row" type="number" label="Row" value={String(data.settings.row)} required={true} />
      </div>
      <div class="column">
        <FormField id="col" name="col" type="number" label="Column" value={String(data.settings.col)} required={true} />
      </div>
    </div>

    {#if form?.error}
      <p class="help is-danger">{form.error}</p>
    {/if}

    <button type="submit" class="button is-primary" disabled={saving}>
      {saving ? 'Saving…' : 'Save'}
    </button>
  </form>
</SettingsCard>