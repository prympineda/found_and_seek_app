<template>
  <div>
   <h1 class="text-primary text-center">Devices List</h1>
    <div class="container text-center">
        <button v-b-modal.deviceFormModal @click="addDeviceForm" class="btn btn-success">Add</button>
        <div class="row">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Name</th>
                        <th>Field</th>
                        <th>Description</th>
                        <th>Image</th>
                        <th>Availability</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(dev, i) in this.devices"
                        :key="i" >
                        <td>{{ dev.id }}</td>
                        <td>{{ dev.name }}</td>
                        <td>{{ dev.field }}</td>
                        <td>{{ dev.description }}</td>
                        <td>
                            <img :src="app_url+dev.image" height="60" width="60">
                        </td>
                        <td> {{ dev.availability == 0 ? 'Available' : 'Not Available' }} </td>
                        <td>
                            <button v-b-modal.deviceFormModal class="btn btn-primary mr-3" @click="editDevice(dev, i)"> Edit </button>
                            <button v-b-modal.confirmationDeleteModal class="btn btn-danger ml-3" @click="showDelete(dev.id , i)"> Delete </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    <b-modal id="deviceFormModal" title="Device" hide-footer>
        <form @submit="submitForm" enctype="multipart/form-data" >
            <div class="form-group mb-4">
                <label for="">Name</label>
                <input type="text" class="form-control" name="name" v-model="post.name" required>
            </div>
            <div class="form-group mb-4">
                <label for="">Image</label>
                <input type="file" id="file" class="form-control" accept="image/jpeg, image/png" ref="file" @change="handleFileUpload" :required="this.device_id == 0">
            </div>
            <div class="form-group mb-4">
                <label for="">Description: </label>
                <textarea name="" id="" class="form-control" v-model="post.description" required></textarea>
            </div>
            <div class="form-group mb-4">
                <label for="">Field</label>
                <select name="" id="" class="form-control" v-model="post.selectedfield" required>
                    <option v-for="(field, i) in fields" :key="i" :selected="field === post.selectedfield">{{field}}</option>
                </select>
            </div>
            <div class="form-group mb-4">
                <label for="">Availability</label>
               <div class="row">
                   <div class="col-md-6">
                        <input type="radio" name="availability" id="available" value="0" v-model="post.availability" :checked="post.availability == 0">
                        <label for="available" class="ml-3">Available</label>
                   </div>
                   <div class="col-md-6">
                        <input type="radio" name="availability" id="not-available" value="1" v-model="post.availability" :checked="post.availability == 1">
                        <label for="not-available" class="ml-3">Not Available</label>
                   </div>
               </div>
            </div>
            <div class="d-flex justify-content-end">
                <button class="mt-3 btn btn-success mr-2" type="submit">Save</button>
                <b-button class="mt-3" @click="$bvModal.hide('deviceFormModal')">Cancel</b-button>
            </div>
        </form>
    </b-modal>
    <b-modal id="confirmationDeleteModal" title="Delete Device" hide-footer>
        <button class="mt-3 btn btn-success mr-2" type="button" @click="deleteDevice">Yes</button>
        <b-button class="mt-3" @click="$bvModal.hide('confirmationDeleteModal')">Cancel</b-button>
    </b-modal>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'found_and_seek_app',
  data () {
      return {
            app_url: process.env.VUE_APP_APP_URL,
            devices: [],
            fields: ['field1', 'field2'],
            post: {
                name: '',
                selectedfield: '',
                description: '',
                availability: 0,
            },
            image: null,
            device_id: 0,
            device_key: 0
        }
  },
  mounted () {
     axios
        .get(`${process.env.VUE_APP_APP_API}/devices`)
        .then(response => {
            this.devices = response.data.data
        })
  },
  methods: {
      addDeviceForm (){
          this.device_id = 0
          this.post.name = ''
          this.post.selectedfield = ''
          this.post.availability = ''
          this.post.description = ''
      },
      editDevice(dev, i){
          this.device_id = dev.id
          this.post.name = dev.name
          this.post.selectedfield = dev.field
          this.post.availability = dev.availability
          this.post.description = dev.description
          this.device_key = i
      },
      submitForm(e){
        e.preventDefault()
        var fd = new FormData();
        fd.append('dev_image', this.image ||'')
        fd.append('name', this.post.name)
        fd.append('description', this.post.description)
        fd.append('selectedfield', this.post.selectedfield)
        fd.append('availability', this.post.availability)
        if(this.device_id == 0){
           
            axios
                .post(`${process.env.VUE_APP_APP_API}/devices`, fd, {
                    headers: {
                    'Content-Type': 'multipart/form-data'
                    }
                })
                .then(response => {
                    let data = response.data.data
                    this.$bvModal.hide('deviceFormModal')
                    this.devices.push(data)
                    
                })
        } else {
            axios
                .post(`${process.env.VUE_APP_APP_API}/devices/${this.device_id}`, fd, {
                    headers: {
                    'Content-Type': 'multipart/form-data'
                    }
                })
                .then(response => {
                    this.$bvModal.hide('deviceFormModal')
                    let data = response.data.data
                    this.$bvToast.toast(`dasda`, {
                        title: 'Device',
                        variant: 'success',
                        solid: true,
                        toaster: 'b-toaster-top-right'
                    })
                    this.devices[this.device_key].name = data.name
                    this.devices[this.device_key].description = data.description
                    this.devices[this.device_key].field = data.field
                    this.devices[this.device_key].availability = data.availability
                    this.devices[this.device_key].image = data.image
                })
        }
      },
      handleFileUpload() {
        this.image = this.$refs.file.files[0]
     },
     showDelete (id, key){
        this.device_key = key
        this.device_id = id
     },
     deleteDevice(){
         let d = this
         axios
            .delete(`${process.env.VUE_APP_APP_API}/devices/${this.device_id}`)
            .then(response => {
                this.$bvToast.toast(`${response.data.message}`, {
                    title: 'Device',
                    variant: 'danger',
                    solid: true,
                    toaster: 'b-toaster-top-right'
                })
                d.devices.splice(d.device_key, 1)
                this.$bvModal.hide('confirmationDeleteModal')
            })
     }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
