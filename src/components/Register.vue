<template>
  <div class="register">
	<form @submit.prevent="handleSubmit">
        <div class="form-group">
            <label for="pname">Name</label>
            <input type="text" v-model="user.pname" v-validate="'required'" name="pname" class="form-control" :class="{ 'is-invalid': submitted && errors.has('pname') }" />
            <div v-if="submitted && errors.has('pname')" class="invalid-feedback">{{ errors.first('pname') }}</div>
        </div>
        <div class="form-group">
            <label for="email">Email</label>
            <input type="text" v-model="user.email" v-validate="'required'" name="email" class="form-control" :class="{ 'is-invalid': submitted && errors.has('email') }" />
            <div v-if="submitted && errors.has('email')" class="invalid-feedback">{{ errors.first('email') }}</div>
        </div>
        <div class="form-group">
            <label for="phnum">Phone number</label>
            <input type="text" v-model="user.phnum" v-validate="'required'" name="phnum" class="form-control" :class="{ 'is-invalid': submitted && errors.has('phnum') }" />
            <div v-if="submitted && errors.has('phnum')" class="invalid-feedback">{{ errors.first('phnum') }}</div>
        </div>
        <div class="form-group">
            <button class="btn btn-primary">Participate</button>
        </div>
    </form>
  </div>
</template>

<script>
export default {
  name: 'Register',
  data () {
    return {
        user: {
            pname: '',
            email: '',
            phnum: ''
        },
        submitted: false
    }
  },
  methods: {
    handleSubmit() {
        this.submitted = true;
        alert(1);
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>